"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectRedis = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
const InjectRedis = () => (0, common_1.Inject)(redis_service_1.RedisService);
exports.InjectRedis = InjectRedis;
//# sourceMappingURL=redis.decorator.js.map