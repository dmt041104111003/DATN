require('dotenv').config();
console.log('ENV loaded:', process.env.DATABASE_URL);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
}
bootstrap();
