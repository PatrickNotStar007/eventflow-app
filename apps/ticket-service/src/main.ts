import { NestFactory } from '@nestjs/core';
import { TicketServiceModule } from './ticket-service.module';
import { ValidationPipe } from '@nestjs/common';
import { SERVICES_PORTS } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(TicketServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(SERVICES_PORTS.TICKETS_SERVICE);
  console.log(
    `Tickets Service запущен на ${SERVICES_PORTS.TICKETS_SERVICE} порту`,
  );
}
bootstrap();
