import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { MeshWallet } from '@meshsdk/core';

const TEST_MNEMONIC = process.env.APP_MNEMONIC || '';
const API_URL = 'http://localhost:3000';

describe('Collections (e2e)', () => {
  let cookie: string;
  let createdCollectionId: string;

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

  describe('GET /collections (public)', () => {
    it('tra ve danh sach collections', async () => {
      const res = await fetch(`${API_URL}/collections`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /collections (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Collection' }),
      });

      expect(res.status).toBe(401);
    });

    it('tao collection thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const res = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({
          name: 'Test Collection E2E',
          description: 'Created by E2E test',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.name).toBe('Test Collection E2E');

      createdCollectionId = data.id;
    });
  });

  describe('PATCH /collections/:id', () => {
    it('cap nhat collection thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie || !createdCollectionId) return;

      const res = await fetch(`${API_URL}/collections/${createdCollectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({
          name: 'Updated Collection E2E',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Collection E2E');
    });
  });

  describe('DELETE /collections/:id', () => {
    it('xoa collection thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie || !createdCollectionId) return;

      const res = await fetch(`${API_URL}/collections/${createdCollectionId}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
