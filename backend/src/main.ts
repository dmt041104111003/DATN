import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const explicitOrigins = [
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowVercelPreview = String(
    process.env.ALLOW_VERCEL_PREVIEW ?? 'true',
  ).toLowerCase() !== 'false';

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (explicitOrigins.includes(origin)) return callback(null, true);
      if (allowVercelPreview && /\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend server running on port ${port}`);
}

bootstrap();
