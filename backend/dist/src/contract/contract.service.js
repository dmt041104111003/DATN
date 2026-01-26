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
const subscription_service_1 = require("../subscription/subscription.service");
const product_service_1 = require("../product/product.service");
const prisma_service_1 = require("../prisma.service");
let ContractService = class ContractService {
    subscriptionService;
    productService;
    prisma;
    blockfrostProvider;
    constructor(subscriptionService, productService, prisma) {
        this.subscriptionService = subscriptionService;
        this.productService = productService;
        this.prisma = prisma;
        this.blockfrostProvider = new core_1.BlockfrostProvider(constants_1.BLOCKFROST_API_KEY);
    }
    async checkSubscriptionActive(userId) {
        const subscription = await this.subscriptionService.getActiveSubscription(userId);
        if (!subscription) {
            throw new common_1.BadRequestException('Subscription has expired. Please renew to continue using this feature.');
        }
        return subscription;
    }
    async verifyProductOwnership(productId, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.userId !== userId) {
            throw new common_1.ForbiddenException('Not your product');
        }
        return product;
    }
    async prepareProductMetadata(productId, userId) {
        await this.verifyProductOwnership(productId, userId);
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                certifications: true,
                productMaterials: {
                    include: {
                        material: {
                            include: {
                                supplier: true,
                            },
                        },
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const metadata = {
            name: product.name,
            productId: product.id,
            description: `Product: ${product.name}`,
        };
        if (product.productMaterials && product.productMaterials.length > 0) {
            metadata.materials = product.productMaterials.map((pm) => ({
                name: pm.material.name,
                quantity: pm.quantity,
                unit: pm.unit || '',
                harvestDate: pm.material.harvestDate?.toISOString() || '',
                supplier: {
                    name: pm.material.supplier.name,
                    location: pm.material.supplier.location || '',
                },
            }));
        }
        if (product.certifications && product.certifications.length > 0) {
            metadata.certifications = product.certifications.map((cert) => ({
                name: cert.certName,
                issueDate: cert.issueDate.toISOString(),
                expiryDate: cert.expiryDate?.toISOString() || '',
                hash: cert.certHash || '',
            }));
        }
        return metadata;
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
    getPolicyId(walletAddress) {
        const wallet = this.createWalletFromAddress(walletAddress);
        const contract = new cip68_contract_1.Cip68Contract({ wallet });
        return {
            policyId: contract.policyId,
            storeAddress: contract.storeAddress,
        };
    }
    async createMint(walletAddress, params, userId) {
        try {
            if (userId) {
                await this.checkSubscriptionActive(userId);
            }
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
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
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
    async createUpdate(walletAddress, params, userId, productId) {
        try {
            if (userId) {
                await this.checkSubscriptionActive(userId);
            }
            if (userId && productId) {
                const product = await this.verifyProductOwnership(productId, userId);
                if (!product.policyId || !product.assetName) {
                    throw new common_1.BadRequestException('Product must be minted before updating metadata');
                }
                if (params.length > 0 && params[0].assetName !== product.assetName) {
                    throw new common_1.BadRequestException('Asset name does not match product');
                }
            }
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
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            if (error instanceof Error) {
                if (error.message.includes('Asset') && error.message.includes('not found')) {
                    throw new common_1.BadRequestException('Product does not support metadata updates. Asset not found on blockchain.');
                }
            }
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
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        product_service_1.ProductService,
        prisma_service_1.PrismaService])
], ContractService);
//# sourceMappingURL=contract.service.js.map