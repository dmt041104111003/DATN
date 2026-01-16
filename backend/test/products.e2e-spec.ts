import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { MeshWallet } from '@meshsdk/core';

const TEST_MNEMONIC = process.env.APP_MNEMONIC || '';
const API_URL = 'http://localhost:3000';

describe('Products (e2e)', () => {
  let cookie: string;
  let createdProductId: string;

  // Login truoc khi test
  beforeAll(async () => {
    if (!TEST_MNEMONIC) return;

    const wallet = new MeshWallet({
      networkId: (Number(process.env.NEXT_PUBLIC_APP_NETWORK) || 0) as 0 | 1,
      key: { type: 'mnemonic', words: TEST_MNEMONIC.split(' ') },
    });

    const address = (await wallet.getChangeAddress()).toString();

    // Lay nonce
    const nonceRes = await fetch(`${API_URL}/auth/nonce?address=${address}`);
    const { nonce } = await nonceRes.json();

    // Ky nonce
    const signedData = await wallet.signData(nonce, address);

    // Login
    const verifyRes = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        signature: signedData.signature,
        key: signedData.key,
      }),
    });

    // Lay cookie
    cookie = verifyRes.headers.get('set-cookie') || '';
  });

  describe('GET /products (public)', () => {
    it('tra ve danh sach san pham', async () => {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /products (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Product' }),
      });

      expect(res.status).toBe(401);
    });

    it('tao san pham thanh cong khi da login', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({
          name: 'Test Product E2E',
          description: 'Created by E2E test',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.name).toBe('Test Product E2E');
      expect(data.id).toBeDefined();

      createdProductId = data.id;
    });
  });

  describe('GET /products/:id (public)', () => {
    it('tra ve chi tiet san pham', async () => {
      if (!createdProductId) return;

      const res = await fetch(`${API_URL}/products/${createdProductId}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdProductId);
    });
  });

  describe('PATCH /products/:id (protected)', () => {
    it('cap nhat san pham thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/products/${createdProductId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({
          name: 'Updated Product E2E',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Product E2E');
    });
  });

  describe('DELETE /products/:id (protected)', () => {
    it('xoa san pham thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/products/${createdProductId}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie },
      });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /products/quota (protected)', () => {
    it('tra ve quota cua user', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const res = await fetch(`${API_URL}/products/quota`, {
        headers: { 'Cookie': cookie },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.tier).toBeDefined();
      expect(data.maxProducts).toBeDefined();
      expect(data.usedProducts).toBeDefined();
      expect(data.remainingProducts).toBeDefined();
      
      console.log('Quota:', data);
    });
  });
});
