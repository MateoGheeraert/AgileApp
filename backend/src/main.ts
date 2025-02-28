import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Open voor alle domeinen (testdoeleinden)
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  // Eventueel een global prefix toevoegen voor REST API's
  app.setGlobalPrefix('api');

  await app.listen(4000, '0.0.0.0');
}
bootstrap();
