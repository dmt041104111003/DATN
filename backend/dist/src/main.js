"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
console.log('ENV loaded:', process.env.DATABASE_URL);
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(process.env.PORT || 3000);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
}
bootstrap();
//# sourceMappingURL=main.js.map