import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
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

  const formatValidationErrors = (items: ValidationError[], parent = ''): string[] => {
    const lines: string[] = [];
    for (const err of items) {
      const path = parent ? `${parent}.${err.property}` : err.property;
      if (err.constraints) {
        const key = Object.keys(err.constraints)[0] || '';
        if (key.includes('whitelistValidation')) {
          lines.push(`Trường "${path}" không được phép.`);
        } else if (key.includes('isNotEmpty') || key.includes('isString')) {
          lines.push(`Trường "${path}" không hợp lệ hoặc bị thiếu.`);
        } else if (key.includes('arrayMinSize') || key.includes('arrayMaxSize')) {
          lines.push(`Trường "${path}" phải có số phần tử hợp lệ.`);
        } else {
          lines.push(`Trường "${path}" không hợp lệ.`);
        }
      }
      if (err.children?.length) lines.push(...formatValidationErrors(err.children, path));
    }
    return lines;
  };

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException(
          formatValidationErrors(errors).join(' ') || 'Dữ liệu gửi lên không hợp lệ.',
        ),
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend server running on port ${port}`);
}

bootstrap();
