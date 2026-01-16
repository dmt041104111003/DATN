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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@meshsdk/core");
const cip68_contract_1 = require("./cip68.contract");
const constants_1 = require("./constants");
let ContractService = class ContractService {
    blockfrostProvider;
    constructor() {
        this.blockfrostProvider = new core_1.BlockfrostProvider(constants_1.BLOCKFROST_API_KEY);
    }
    createWalletFromAddress(walletAddress) {
        return new core_1.MeshWallet({
            networkId: constants_1.appNetworkId,
            fetcher: this.blockfrostProvider,
            submitter: this.blockfrostProvider,
            key: {
                type: 'address',
                address: walletAddress,
            },
        });
    }
    async getPolicyId(walletAddress) {
        const wallet = this.createWalletFromAddress(walletAddress);
        const contract = new cip68_contract_1.Cip68Contract({ wallet });
        return {
            policyId: contract.policyId,
            storeAddress: contract.storeAddress,
        };
    }
    async createMint(walletAddress, params) {
        try {
            const wallet = this.createWalletFromAddress(walletAddress);
            const contract = new cip68_contract_1.Cip68Contract({ wallet });
            const pubKeyHash = (0, core_1.deserializeAddress)(walletAddress).pubKeyHash;
            const assets = params.map((p) => ({
                assetName: p.assetName,
                quantity: p.quantity || '1',
                receiver: p.receiver || walletAddress,
                metadata: {
                    ...p.metadata,
                    _pk: pubKeyHash,
                },
            }));
            const unsignedTx = await contract.mint(assets);
            return {
                result: true,
                data: unsignedTx,
                message: 'Transaction created successfully',
            };
        }
        catch (error) {
            return {
                result: false,
                data: null,
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async createBurn(walletAddress, params) {
        try {
            const wallet = this.createWalletFromAddress(walletAddress);
            const contract = new cip68_contract_1.Cip68Contract({ wallet });
            const assets = params.map((p) => ({
                assetName: p.assetName,
                quantity: p.quantity || '-1',
            }));
            const unsignedTx = await contract.burn(assets);
            return {
                result: true,
                data: unsignedTx,
                message: 'Transaction created successfully',
            };
        }
        catch (error) {
            return {
                result: false,
                data: null,
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async createUpdate(walletAddress, params) {
        try {
            const wallet = this.createWalletFromAddress(walletAddress);
            const contract = new cip68_contract_1.Cip68Contract({ wallet });
            const pubKeyHash = (0, core_1.deserializeAddress)(walletAddress).pubKeyHash;
            const assets = params.map((p) => ({
                assetName: p.assetName,
                metadata: {
                    ...p.metadata,
                    _pk: pubKeyHash,
                },
            }));
            const unsignedTx = await contract.update(assets);
            return {
                result: true,
                data: unsignedTx,
                message: 'Transaction created successfully',
            };
        }
        catch (error) {
            return {
                result: false,
                data: null,
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async createPayment(walletAddress, amount) {
        try {
            const wallet = this.createWalletFromAddress(walletAddress);
            const contract = new cip68_contract_1.Cip68Contract({ wallet });
            const unsignedTx = await contract.payment({ amount });
            return {
                result: true,
                data: unsignedTx,
                message: 'Transaction created successfully',
            };
        }
        catch (error) {
            return {
                result: false,
                data: null,
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ContractService);
//# sourceMappingURL=contract.service.js.map