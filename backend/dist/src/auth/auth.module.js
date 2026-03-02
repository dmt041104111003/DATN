"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../core/config/config.module");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const auth_repository_1 = require("./domain/auth.repository");
const prisma_auth_repository_1 = require("./infra/prisma-auth.repository");
const nonce_store_port_1 = require("./domain/nonce-store.port");
const in_memory_nonce_store_1 = require("./infra/in-memory-nonce.store");
const generate_nonce_use_case_1 = require("./application/use-cases/generate-nonce.use-case");
const verify_and_issue_token_use_case_1 = require("./application/use-cases/verify-and-issue-token.use-case");
const create_profile_and_issue_token_use_case_1 = require("./application/use-cases/create-profile-and-issue-token.use-case");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        providers: [
            auth_service_1.AuthService,
            {
                provide: auth_repository_1.AUTH_REPOSITORY,
                useClass: prisma_auth_repository_1.PrismaAuthRepository,
            },
            {
                provide: nonce_store_port_1.NONCE_STORE,
                useClass: in_memory_nonce_store_1.InMemoryNonceStore,
            },
            generate_nonce_use_case_1.GenerateNonceUseCase,
            verify_and_issue_token_use_case_1.VerifyAndIssueTokenUseCase,
            create_profile_and_issue_token_use_case_1.CreateProfileAndIssueTokenUseCase,
        ],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map