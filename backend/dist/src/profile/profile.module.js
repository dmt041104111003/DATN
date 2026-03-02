"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../core/config/config.module");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const upload_module_1 = require("../upload/upload.module");
const profile_controller_1 = require("./profile.controller");
const profile_service_1 = require("./profile.service");
const profile_repository_1 = require("./domain/profile.repository");
const prisma_profile_repository_1 = require("./infra/prisma-profile.repository");
const avatar_storage_port_1 = require("./domain/avatar-storage.port");
const upload_avatar_storage_1 = require("./infra/upload-avatar.storage");
const list_profiles_use_case_1 = require("./application/use-cases/list-profiles.use-case");
const list_profiles_by_role_use_case_1 = require("./application/use-cases/list-profiles-by-role.use-case");
const update_profile_use_case_1 = require("./application/use-cases/update-profile.use-case");
const upload_profile_avatar_use_case_1 = require("./application/use-cases/upload-profile-avatar.use-case");
let ProfileModule = class ProfileModule {
};
exports.ProfileModule = ProfileModule;
exports.ProfileModule = ProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule, prisma_module_1.PrismaModule, auth_module_1.AuthModule, upload_module_1.UploadModule],
        providers: [
            profile_service_1.ProfileService,
            {
                provide: profile_repository_1.PROFILE_REPOSITORY,
                useClass: prisma_profile_repository_1.PrismaProfileRepository,
            },
            {
                provide: avatar_storage_port_1.AVATAR_STORAGE,
                useClass: upload_avatar_storage_1.UploadAvatarStorage,
            },
            list_profiles_use_case_1.ListProfilesUseCase,
            list_profiles_by_role_use_case_1.ListProfilesByRoleUseCase,
            update_profile_use_case_1.UpdateProfileUseCase,
            upload_profile_avatar_use_case_1.UploadProfileAvatarUseCase,
        ],
        controllers: [profile_controller_1.ProfileController],
    })
], ProfileModule);
//# sourceMappingURL=profile.module.js.map