import { Module } from '@nestjs/common';
import { NotificationsServiceController } from './notifications-service.controller';
import { NotificationsServiceService } from './notifications-service.service';
import { EmailService } from './email.service';
import { KafkaModule } from '@app/kafka';

@Module({
  imports: [KafkaModule.register('notifications-consumer-group')],
  controllers: [NotificationsServiceController],
  providers: [NotificationsServiceService, EmailService],
})
export class NotificationsServiceModule {}
