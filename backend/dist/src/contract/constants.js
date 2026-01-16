"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.title = exports.EXCHANGE_FEE_PRICE = exports.appNetworkId = exports.appNetwork = exports.APP_WALLET_ADDRESS = exports.BLOCKFROST_API_KEY = void 0;
exports.BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || '';
exports.APP_WALLET_ADDRESS = process.env.APP_WALLET_ADDRESS || '';
exports.appNetwork = process.env.NEXT_PUBLIC_APP_NETWORK?.toLowerCase() || 'preprod';
exports.appNetworkId = exports.appNetwork === 'mainnet' ? 1 : 0;
exports.EXCHANGE_FEE_PRICE = process.env.EXCHANGE_FEE_PRICE || '1000000';
exports.title = {
    mint: 'mint.mint.mint',
    store: 'store.store.spend',
};
//# sourceMappingURL=constants.js.map