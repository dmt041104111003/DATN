import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { MeshWallet } from '@meshsdk/core';

const TEST_MNEMONIC = process.env.APP_MNEMONIC || '';
const API_URL = 'http://localhost:3000';

describe('Suppliers (e2e)', () => {
  let cookie: string;
  let createdSupplierId: string;

  beforeAll(async () => {
    if (!TEST_MNEMONIC) return;

    const wallet = new MeshWallet({
      networkId: (Number(process.env.NEXT_PUBLIC_APP_NETWORK) || 0) as 0 | 1,
      key: { type: 'mnemonic', words: TEST_MNEMONIC.split(' ') },
    });

    const address = (await wallet.getChangeAddress()).toString();
    const nonceRes = await fetch(`${API_URL}/auth/nonce?address=${address}`);
    const { nonce } = await nonceRes.json();
    const signedData = await wallet.signData(nonce, address);

    const verifyRes = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        signature: signedData.signature,
        key: signedData.key,
      }),
    });

    cookie = verifyRes.headers.get('set-cookie') || '';
  });

  describe('GET /suppliers (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/suppliers`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach suppliers cua user', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const res = await fetch(`${API_URL}/suppliers`, {
        headers: { 'Cookie': cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /suppliers', () => {
    it('tao supplier thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const res = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({
          name: 'Test Supplier E2E',
          location: 'Vietnam',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.name).toBe('Test Supplier E2E');

      createdSupplierId = data.id;
    });
  });

  describe('PATCH /suppliers/:id', () => {
    it('cap nhat supplier thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie || !createdSupplierId) return;

      const res = await fetch(`${API_URL}/suppliers/${createdSupplierId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({
          name: 'Updated Supplier E2E',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Supplier E2E');
    });
  });

  describe('DELETE /suppliers/:id', () => {
    it('xoa supplier thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie || !createdSupplierId) return;

      const res = await fetch(`${API_URL}/suppliers/${createdSupplierId}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
