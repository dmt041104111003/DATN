"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const config_module_1 = require("../core/config/config.module");
const ipfs_controller_1 = require("./ipfs.controller");
const ipfs_service_1 = require("./ipfs.service");
const ipfs_client_port_1 = require("./domain/ipfs-client.port");
const pinata_ipfs_client_1 = require("./infra/pinata-ipfs.client");
const upload_file_use_case_1 = require("./application/use-cases/upload-file.use-case");
const get_gateway_url_use_case_1 = require("./application/use-cases/get-gateway-url.use-case");
let IpfsModule = class IpfsModule {
};
exports.IpfsModule = IpfsModule;
exports.IpfsModule = IpfsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule, auth_module_1.AuthModule],
        providers: [
            ipfs_service_1.IpfsService,
            {
                provide: ipfs_client_port_1.IPFS_CLIENT,
                useClass: pinata_ipfs_client_1.PinataIpfsClient,
            },
            upload_file_use_case_1.UploadFileUseCase,
            get_gateway_url_use_case_1.GetGatewayUrlUseCase,
        ],
        controllers: [ipfs_controller_1.IpfsController],
        exports: [ipfs_service_1.IpfsService],
    })
], IpfsModule);
//# sourceMappingURL=ipfs.module.js.map