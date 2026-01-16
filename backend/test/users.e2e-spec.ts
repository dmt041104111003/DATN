import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { MeshWallet } from '@meshsdk/core';

const TEST_MNEMONIC = process.env.APP_MNEMONIC || '';
const API_URL = 'http://localhost:3000';

describe('Users (e2e)', () => {
  let cookie: string;
  let userAddress: string;

  beforeAll(async () => {
    if (!TEST_MNEMONIC) return;

    const wallet = new MeshWallet({
      networkId: (Number(process.env.NEXT_PUBLIC_APP_NETWORK) || 0) as 0 | 1,
      key: { type: 'mnemonic', words: TEST_MNEMONIC.split(' ') },
    });

    userAddress = (await wallet.getChangeAddress()).toString();
    const nonceRes = await fetch(`${API_URL}/auth/nonce?address=${userAddress}`);
    const { nonce } = await nonceRes.json();
    const signedData = await wallet.signData(nonce, userAddress);

    const verifyRes = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: userAddress,
        signature: signedData.signature,
        key: signedData.key,
      }),
    });

    cookie = verifyRes.headers.get('set-cookie') || '';
  });

  describe('GET /users/me (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/users/me`);
      expect(res.status).toBe(401);
    });

    it('tra ve thong tin user hien tai', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const res = await fetch(`${API_URL}/users/me`, {
        headers: { 'Cookie': cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.address).toBe(userAddress);
      expect(data.id).toBeDefined();
    });
  });

  describe('PATCH /users/me', () => {
    it('cap nhat profile thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({}), 
      });

      expect(res.status).toBe(200);
    });
  });
});
