"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@meshsdk/core");
const TEST_MNEMONIC = process.env.APP_MNEMONIC;
async function getSignature() {
    const wallet = new core_1.MeshWallet({
        networkId: 0,
        key: {
            type: 'mnemonic',
            words: TEST_MNEMONIC?.split(' ') || [],
        },
    });
    const address = (await wallet.getChangeAddress()).toString();
    console.log('\n========== WALLET INFO ==========');
    console.log('Address:', address);
    const nonce = 'test-nonce-' + Date.now();
    console.log('\n========== NONCE ==========');
    console.log('Nonce:', nonce);
    const signedData = await wallet.signData(address, nonce);
    console.log('\n========== COPY VÀO POSTMAN ==========');
    console.log(JSON.stringify({
        address: address,
        signature: signedData.signature,
        key: signedData.key,
    }, null, 2));
    console.log('\n========== FULL FLOW TEST ==========');
    console.log('1. GET nonce: http://localhost:3000/auth/nonce?address=' + address);
    console.log('2. Thay nonce mới vào script, chạy lại');
    console.log('3. POST verify với JSON ở trên');
}
getSignature().catch(console.error);
//# sourceMappingURL=get-signature.js.map