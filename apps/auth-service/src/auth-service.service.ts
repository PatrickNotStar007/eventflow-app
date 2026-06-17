import { DatabaseService, users } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hasgedPassword = await bcrypt.hash(password, 10);

    const [user] = await this.dbService.db
      .insert(users)
      .values({ email, password: hasgedPassword, name })
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString(),
    });

    return { message: 'Пользователь успешно зарегистрирован', userId: user.id };
  }

  async login(email: string, password: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    this.kafkaClient.emit(KAFKA_TOPICS.USER_LOGGED_IN, {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString(),
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const [user] = await this.dbService.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }
}
