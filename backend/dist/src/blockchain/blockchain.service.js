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
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const blockfrost_js_1 = require("@blockfrost/blockfrost-js");
let BlockchainService = class BlockchainService {
    blockfrost;
    platformWallet;
    constructor() {
        const projectId = process.env.BLOCKFROST_API_KEY;
        if (!projectId) {
            console.warn('BLOCKFROST_API_KEY not set - payment verification disabled');
        }
        this.blockfrost = new blockfrost_js_1.BlockFrostAPI({
            projectId: projectId || 'dummy',
            network: process.env.NEXT_PUBLIC_APP_NETWORK === 'mainnet' ? 'mainnet' : 'preprod',
        });
        this.platformWallet = process.env.APP_WALLET_ADDRESS || '';
    }
    async verifyPayment(txHash, expectedAmount) {
        if (!process.env.BLOCKFROST_API_KEY) {
            console.warn('Skipping payment verification - BLOCKFROST_API_KEY not set');
            return { valid: true, message: 'Verification skipped (dev mode)' };
        }
        if (!this.platformWallet) {
            throw new common_1.BadRequestException('Platform wallet not configured');
        }
        try {
            const tx = await this.blockfrost.txs(txHash);
            if (!tx.block) {
                return { valid: false, message: 'Transaction not yet confirmed' };
            }
            const utxos = await this.blockfrost.txsUtxos(txHash);
            let receivedAmount = 0;
            for (const output of utxos.outputs) {
                if (output.address === this.platformWallet) {
                    const lovelace = output.amount.find(a => a.unit === 'lovelace');
                    if (lovelace) {
                        receivedAmount += parseInt(lovelace.quantity);
                    }
                }
            }
            const receivedADA = receivedAmount / 1_000_000;
            if (receivedADA < expectedAmount) {
                return {
                    valid: false,
                    message: `Insufficient payment. Expected ${expectedAmount} ADA, received ${receivedADA} ADA`,
                    confirmedAmount: receivedADA,
                };
            }
            return {
                valid: true,
                message: 'Payment verified successfully',
                confirmedAmount: receivedADA,
            };
        }
        catch (error) {
            if (error.status_code === 404) {
                return { valid: false, message: 'Transaction not found' };
            }
            throw new common_1.BadRequestException(`Failed to verify transaction: ${error.message}`);
        }
    }
    async getTransactionInfo(txHash) {
        if (!process.env.BLOCKFROST_API_KEY) {
            return null;
        }
        try {
            const tx = await this.blockfrost.txs(txHash);
            const utxos = await this.blockfrost.txsUtxos(txHash);
            return { tx, utxos };
        }
        catch {
            return null;
        }
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map