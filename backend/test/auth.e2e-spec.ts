import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { MeshWallet } from '@meshsdk/core';

const TEST_MNEMONIC = process.env.APP_MNEMONIC || '';
const API_URL = 'http://localhost:3000';

describe('Auth Flow (e2e)', () => {
  let wallet: MeshWallet;
  let address: string;

  beforeAll(async () => {
    if (!TEST_MNEMONIC) {
      return;
    }

    wallet = new MeshWallet({
      networkId: (Number(process.env.NEXT_PUBLIC_APP_NETWORK) || 0) as 0 | 1,
      key: {
        type: 'mnemonic',
        words: TEST_MNEMONIC.split(' '),
      },
    });

    address = (await wallet.getChangeAddress()).toString();
    console.log('address:', address);
  });

  describe('GET /auth/nonce', () => {
    it('tra ve nonce khi co address hop le', async () => {
      if (!TEST_MNEMONIC) return;

      const res = await fetch(`${API_URL}/auth/nonce?address=${address}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.nonce).toBeDefined();
      expect(typeof data.nonce).toBe('string');
      
      console.log('nonce:', data.nonce);
    });

    it('loi 400 khi khong co address', async () => {
      const res = await fetch(`${API_URL}/auth/nonce`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/verify', () => {
    it('login thanh cong voi signature hop le', async () => {
      if (!TEST_MNEMONIC) {
        return;
      }

      // Buoc 1: Lay nonce
      const nonceRes = await fetch(`${API_URL}/auth/nonce?address=${address}`);
      const { nonce } = await nonceRes.json();
      console.log('nonce:', nonce);

      // Buoc 2: Ky nonce
      const signedData = await wallet.signData(nonce, address);
      console.log('signedData:', signedData);

      // Buoc 3: Verify
      const verifyRes = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature: signedData.signature,
          key: signedData.key,
        }),
      });

      const result = await verifyRes.json();

      expect(verifyRes.status).toBe(201);
      expect(result.user).toBeDefined();
      expect(result.user.address).toBe(address);
      
      console.log('result:', result);
    });

    it('loi 401 khi signature khong hop le', async () => {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: 'addr_test1fake',
          signature: 'invalid',
          key: 'invalid',
        }),
      });

      expect(res.status).toBe(401);
    });

    it('loi 401 khi chua lay nonce', async () => {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: 'addr_test1_new_address_no_nonce',
          signature: 'test',
          key: 'test',
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('xoa cookie thanh cong', async () => {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
      });

      const data = await res.json();
      
      expect(res.status).toBe(201);
      expect(data.message).toBe('Logged out');
    });
  });
});
