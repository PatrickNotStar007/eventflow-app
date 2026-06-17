import { NestFactory } from '@nestjs/core';
import { NotificationsServiceModule } from './notifications-service.module';
import { SERVICES_PORTS } from '@app/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KAFKA_BROKER_URL, KAFKA_CLIENT_ID } from '@app/kafka';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${KAFKA_CLIENT_ID}-notifications`,
        brokers: [KAFKA_BROKER_URL],
      },
      consumer: {
        groupId: `notifications-consumer-group`,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(SERVICES_PORTS.NOTIFICATIONS_SERVICE);
  console.log('KAFKA консьюмер запущен');
  console.log(
    `Notifications Service запущен на ${SERVICES_PORTS.NOTIFICATIONS_SERVICE} порту`,
  );
}
bootstrap();
