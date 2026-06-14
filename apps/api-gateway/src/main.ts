import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVICES_PORTS } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(SERVICES_PORTS.API_GATEWAY);

  console.log(`Api Gateway запущен на ${SERVICES_PORTS.API_GATEWAY} порту`);
}
bootstrap();
