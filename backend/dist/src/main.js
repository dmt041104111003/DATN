"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const express = require("express");
console.log("[main] Starting...");
const log = new common_1.Logger("Exception");
class LoggingExceptionFilter {
    catch(exception, host) {
        var _a;
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const isHttp = exception instanceof common_1.HttpException;
        const status = isHttp ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message;
        if (isHttp) {
            const body = exception.getResponse();
            message = typeof body === "object" && body && typeof body.message === "string"
                ? body.message
                : String(body);
        }
        else {
            const err = exception;
            const parts = [(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : String(exception)];
            if ((err === null || err === void 0 ? void 0 : err.error) != null)
                parts.push(`error: ${String(err.error)}`);
            if (Array.isArray(err === null || err === void 0 ? void 0 : err.errors))
                parts.push(`errors: ${JSON.stringify(err.errors)}`);
            message = parts.join(" | ");
            log.error(`Unhandled: ${message}`, err === null || err === void 0 ? void 0 : err.stack);
        }
        res.status(status).json({ statusCode: status, message });
    }
}
async function bootstrap() {
    var _a, _b;
    const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
    console.log("[main] Bootstrap: creating Express and Nest app...");
    const server = express();
    server.use(express.json({ limit: "10mb" }));
    server.use(express.urlencoded({ limit: "10mb", extended: true }));
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
    app.useGlobalFilters(new LoggingExceptionFilter());
    app.enableCors({
        origin: (_b = process.env.CORS_ORIGIN) !== null && _b !== void 0 ? _b : true,
        credentials: true,
    });
    await app.listen(port);
    console.log(`[main] Server listening on http://localhost:${port}`);
}
bootstrap().catch((e) => {
    console.error("[main] Bootstrap failed:", e);
    process.exit(1);
});
//# sourceMappingURL=main.js.map