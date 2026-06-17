import { Controller, Get, Logger } from '@nestjs/common';
import { NotificationsServiceService } from './notifications-service.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@app/kafka';

@Controller()
export class NotificationsServiceController {
  private readonly logger = new Logger(NotificationsServiceService.name);

  constructor(
    private readonly notificationsServiceService: NotificationsServiceService,
  ) {}

  @Get('health')
  healthCheck() {
    return { status: 'OK', service: 'notifications-service' };
  }

  @EventPattern(KAFKA_TOPICS.USER_REGISTERED)
  async handleUserRegistered(
    @Payload()
    data: {
      userId: string;
      email: string;
      name: string;
    },
  ) {
    this.logger.log(
      `Получено событие о регистрации пользователя: ${JSON.stringify(data)}`,
    );
    await this.notificationsServiceService.sendWelcomeEmail(data);
  }

  @EventPattern(KAFKA_TOPICS.TICKET_PURCHASED)
  async handleTicketPurchased(
    @Payload()
    data: {
      ticketId: string;
      ticketCode: string;
      userId: string;
      quantity: number;
      totalPrice: number;
    },
  ) {
    this.logger.log(
      `Получено событие о покупке билета: ${JSON.stringify(data)}`,
    );
    await this.notificationsServiceService.sendTicketPurchasedEmail(data);
  }

  @EventPattern(KAFKA_TOPICS.TICKET_CANCELED)
  async handleTicketCancelled(
    @Payload()
    data: {
      ticketId: string;
      userId: string;
    },
  ) {
    this.logger.log(
      `Получено событие об отмене билета: ${JSON.stringify(data)}`,
    );
    await this.notificationsServiceService.sendTicketCancelledEmail(data);
  }
}
