import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

const express = require("express") as typeof import("express");

console.log("[main] Starting...");

const log = new Logger("Exception");

class LoggingExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<{ status: (code: number) => { json: (body: object) => void } }>();
    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string;
    if (isHttp) {
      const body = exception.getResponse();
      message = typeof body === "object" && body && typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : String(body);
    } else {
      const err = exception as Error & { error?: unknown; errors?: unknown[] };
      const parts = [err?.message ?? String(exception)];
      if (err?.error != null) parts.push(`error: ${String(err.error)}`);
      if (Array.isArray(err?.errors)) parts.push(`errors: ${JSON.stringify(err.errors)}`);
      message = parts.join(" | ");
      log.error(`Unhandled: ${message}`, err?.stack);
    }
    res.status(status).json({ statusCode: status, message });
  }
}

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  console.log("[main] Bootstrap: creating Express and Nest app...");
  const server = express();
  server.use(express.json({ limit: "10mb" }));
  server.use(express.urlencoded({ limit: "10mb", extended: true }));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalFilters(new LoggingExceptionFilter());
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true,
  });
  await app.listen(port);
  console.log(`[main] Server listening on http://localhost:${port}`);
}

bootstrap().catch((e) => {
  console.error("[main] Bootstrap failed:", e);
  process.exit(1);
});
