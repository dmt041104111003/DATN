import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const normalizeOrigin = (value: string) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const configuredOrigins = String(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
    .split(',')
    .map((v) => normalizeOrigin(v))
    .map((v) => v.trim())
    .filter(Boolean);

  const allowVercelPreview = String(process.env.ALLOW_VERCEL_PREVIEW ?? 'true')
    .toLowerCase() !== 'false';

  app.enableCors({
    origin: (origin, callback) => {
      // Non-browser requests may not provide Origin header
      if (!origin) return callback(null, true);

      // origin should already include scheme (e.g. https://host)
      const normalizedRequestOrigin = normalizeOrigin(origin);

      if (configuredOrigins.includes(normalizedRequestOrigin)) return callback(null, true);
      if (allowVercelPreview && /\.vercel\.app$/i.test(normalizedRequestOrigin)) return callback(null, true);

      return callback(new Error(`Origin ${origin} not allowed`), false);
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
