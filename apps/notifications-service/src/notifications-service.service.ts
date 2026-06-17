import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsServiceService {
  private readonly logger = new Logger(NotificationsServiceService.name);

  constructor(private readonly emailService: EmailService) {}

  async sendWelcomeEmail(data: {
    userId: string;
    email: string;
    name: string;
  }) {
    this.logger.log(
      `Отправка приветственного письма пользователю ${data.email}`,
    );

    const html = `
      <h1>${data.name}, добро пожаловать на EventFlow</h1>
      <p>Твой аккаунт успещно создан.</p>
      <p>Теперь ты можешь:</p>
      <ul>
        <li>Узнать о новых событиях</li>
        <li>Купить билеты</li>
        <li>Создать свои собственные события</li>
      </ul>
    `;

    await this.emailService.sendEmail(
      data.email,
      'Добро пожаловать на EventFlow',
      html,
    );
  }

  async sendTicketPurchasedEmail(data: {
    userId: string;
    email?: string;
    ticketCode: string;
    eventTitle?: string;
    quantity: number;
    totalPrice: number;
  }) {
    const email = data.email || 'user@example.com';
    this.logger.log(`Отправка подтверждающего письма пользователю ${email}`);

    const html = `
      <h1>Билет получен!</h1>
      <p>Билет успешно куплен.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Event:</strong> ${data.eventTitle || 'Ваше событие'}</p>
        <p><strong>Ticket Code:</strong> ${data.ticketCode}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Total:</strong> $${(data.totalPrice / 100).toFixed(2)}</p>
      </div>
      <p>Покажите этот код билета на входе.</p>
    `;

    await this.emailService.sendEmail(email, 'Билет получен!', html);
  }

  async sendTicketCancelledEmail(data: {
    ticketId: string;
    userId: string;
    email?: string;
  }) {
    const email = data.email || 'user@example.com';
    this.logger.log(`Sending cancellation notice to ${email}`);

    const html = `
      <h1>Билет отменён</h1>
      <p>Билет успешно отменён.</p>
      <p>Если вы не запрашивали отмену, обратитесь в поддержку.</p>
    `;

    await this.emailService.sendEmail(email, 'Ticket Cancelled', html);
  }

  sendEventCancelledEmail(data: {
    eventId: string;
    eventTitle?: string;
    organizerId: string;
  }) {
    this.logger.log(
      `Отправка уведомления об отмене пользователю ${data.organizerId}`,
    );
  }
}
