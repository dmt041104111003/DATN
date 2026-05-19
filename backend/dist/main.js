"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const normalizeOrigin = (value) => {
        const trimmed = String(value || "").trim();
        if (!trimmed)
            return trimmed;
        if (/^https?:\/\//i.test(trimmed))
            return trimmed;
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
            if (!origin)
                return callback(null, true);
            const normalizedRequestOrigin = normalizeOrigin(origin);
            if (configuredOrigins.includes(normalizedRequestOrigin))
                return callback(null, true);
            if (allowVercelPreview && /\.vercel\.app$/i.test(normalizedRequestOrigin))
                return callback(null, true);
            return callback(new Error(`Origin ${origin} not allowed`), false);
        },
        credentials: true,
        exposedHeaders: ['Content-Range', 'X-Total-Count'],
    });
    const formatValidationErrors = (items, parent = '') => {
        const lines = [];
        for (const err of items) {
            const path = parent ? `${parent}.${err.property}` : err.property;
            if (err.constraints) {
                const key = Object.keys(err.constraints)[0] || '';
                if (key.includes('whitelistValidation')) {
                    lines.push(`Trường "${path}" không được phép.`);
                }
                else if (key.includes('isNotEmpty') || key.includes('isString')) {
                    lines.push(`Trường "${path}" không hợp lệ hoặc bị thiếu.`);
                }
                else if (key.includes('arrayMinSize') || key.includes('arrayMaxSize')) {
                    lines.push(`Trường "${path}" phải có số phần tử hợp lệ.`);
                }
                else {
                    lines.push(`Trường "${path}" không hợp lệ.`);
                }
            }
            if (err.children?.length)
                lines.push(...formatValidationErrors(err.children, path));
        }
        return lines;
    };
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => new common_1.BadRequestException(formatValidationErrors(errors).join(' ') || 'Dữ liệu gửi lên không hợp lệ.'),
    }));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Backend server running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map