"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@meshsdk/core");
const TEST_MNEMONIC = 'solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution solution';
const API_URL = 'http://localhost:3000';
async function main() {
    console.log('🔐 Khởi tạo wallet...\n');
    const wallet = new core_1.MeshWallet({
        networkId: 0,
        key: {
            type: 'mnemonic',
            words: TEST_MNEMONIC.split(' '),
        },
    });
    const address = (await wallet.getChangeAddress()).toString();
    console.log('📍 Address:', address);
    console.log('\n📡 Gọi API lấy nonce...');
    const nonceRes = await fetch(`${API_URL}/auth/nonce?address=${address}`);
    if (!nonceRes.ok) {
        console.error('❌ Lỗi lấy nonce:', await nonceRes.text());
        return;
    }
    const { nonce } = await nonceRes.json();
    console.log('🎲 Nonce:', nonce);
    console.log('\n✍️  Đang ký nonce...');
    const signedData = await wallet.signData(address, nonce);
    console.log('✅ Signature:', signedData.signature.substring(0, 50) + '...');
    console.log('✅ Key:', signedData.key.substring(0, 50) + '...');
    console.log('\n' + '='.repeat(50));
    console.log('📋 COPY JSON NÀY VÀO POSTMAN BODY:');
    console.log('='.repeat(50));
    const postmanBody = {
        address: address,
        signature: signedData.signature,
        key: signedData.key,
    };
    console.log(JSON.stringify(postmanBody, null, 2));
    console.log('\n' + '='.repeat(50));
    console.log('🌐 POST đến: ' + API_URL + '/auth/verify');
    console.log('='.repeat(50));
    console.log('\n🚀 Tự động gọi verify...');
    const verifyRes = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postmanBody),
    });
    const result = await verifyRes.json();
    if (verifyRes.ok) {
        console.log('✅ LOGIN THÀNH CÔNG!');
        console.log('👤 User:', JSON.stringify(result.user, null, 2));
    }
    else {
        console.log('❌ LOGIN THẤT BẠI:', result);
    }
}
main().catch(console.error);
//# sourceMappingURL=test-auth-flow.js.map