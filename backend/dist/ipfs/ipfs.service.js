"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsService = void 0;
const common_1 = require("@nestjs/common");
const ipfs_client_port_1 = require("./domain/ipfs-client.port");
const upload_file_use_case_1 = require("./application/use-cases/upload-file.use-case");
const get_gateway_url_use_case_1 = require("./application/use-cases/get-gateway-url.use-case");
let IpfsService = class IpfsService {
    constructor(ipfsClient, uploadFileUseCase, getGatewayUrlUseCase) {
        this.ipfsClient = ipfsClient;
        this.uploadFileUseCase = uploadFileUseCase;
        this.getGatewayUrlUseCase = getGatewayUrlUseCase;
    }
    getGatewayUrl(hash) {
        return this.getGatewayUrlUseCase.execute(hash);
    }
    async uploadFile(file) {
        return this.uploadFileUseCase.execute(file);
    }
};
exports.IpfsService = IpfsService;
exports.IpfsService = IpfsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ipfs_client_port_1.IPFS_CLIENT)),
    __metadata("design:paramtypes", [Object, upload_file_use_case_1.UploadFileUseCase,
        get_gateway_url_use_case_1.GetGatewayUrlUseCase])
], IpfsService);
//# sourceMappingURL=ipfs.service.js.map