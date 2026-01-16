import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { MeshWallet } from '@meshsdk/core';

const TEST_MNEMONIC = process.env.APP_MNEMONIC || '';
const API_URL = 'http://localhost:3000';

describe('Subscriptions (e2e)', () => {
  let cookie: string;
  let createdSubscriptionId: string;

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

  describe('GET /subscriptions (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/subscriptions`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach subscriptions cua user', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const res = await fetch(`${API_URL}/subscriptions`, {
        headers: { 'Cookie': cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /subscriptions', () => {
    it('tao subscription thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie) return;

      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({
          servicePlanId: 'starter',
          startDate,
          endDate,
          status: 'pending',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.servicePlanId).toBe('starter');
      expect(data.status).toBe('pending');

      createdSubscriptionId = data.id;
    });
  });

  describe('PATCH /subscriptions/:id', () => {
    it('cap nhat subscription thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie || !createdSubscriptionId) return;

      const res = await fetch(`${API_URL}/subscriptions/${createdSubscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
        },
        body: JSON.stringify({
          status: 'active',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe('active');
    });
  });

  describe('DELETE /subscriptions/:id', () => {
    it('xoa subscription thanh cong', async () => {
      if (!TEST_MNEMONIC || !cookie || !createdSubscriptionId) return;

      const res = await fetch(`${API_URL}/subscriptions/${createdSubscriptionId}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
