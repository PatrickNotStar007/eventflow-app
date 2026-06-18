import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceService } from './auth-service.service';
import { KAFKA_SERVICE } from '@app/kafka';
import { DatabaseService } from '@app/database';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthServiceSerive', () => {
  let service: AuthServiceService;

  const mockKafkaClient = {
    emit: jest.fn(),
    connect: jest.fn(),
  };

  const mockDbService = {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnValue([]),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceService,
        { provide: KAFKA_SERVICE, useValue: mockKafkaClient },
        { provide: DatabaseService, useValue: mockDbService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthServiceService>(AuthServiceService);
  });

  describe('register', () => {
    it('успешно регистрирует нового пользователя', async () => {
      mockDbService.db.limit.mockReturnValueOnce([]);

      const mockUser = {
        id: 'user-id-123',
        email: 'test@mail.ru',
        name: 'Amogus',
      };

      mockDbService.db.returning.mockReturnValueOnce([mockUser]);

      const result = await service.register(
        'test@mail.ru',
        'securePassword',
        'Amogus',
      );

      expect(result).toEqual({
        message: 'Пользователь успешно зарегистрирован',
        userId: 'user-id-123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('securePassword', 10);

      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.objectContaining({
          userId: 'user-id-123',
          email: 'test@mail.ru',
          name: 'Amogus',
        }),
      );
    });

    it('выбрасывает ConflictException если пользователь уже существует', async () => {
      mockDbService.db.limit.mockReturnValueOnce([
        { id: 'existing-user-id', email: 'test@mail.ru' },
      ]);

      await expect(
        service.register('test@mail.ru', 'anyPassword', 'Amogus'),
      ).rejects.toThrow('Пользователь с таким email уже существует');
    });
  });
});
