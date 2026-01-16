import { BlockfrostProvider, MeshWallet } from '@meshsdk/core';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000';
const blockfrostProvider = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY || '',
);

describe('Payment Flow (e2e)', () => {
  let wallet: MeshWallet;
  let authCookie: string;
  let walletAddress: string;

  beforeAll(async () => {
    wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.APP_MNEMONIC?.split(' ') || [],
      },
    });

    walletAddress = await wallet.getChangeAddress();
    console.log('Test wallet:', walletAddress);

    // Login
    const nonceRes = await request(API_URL).get(
      `/auth/nonce?address=${walletAddress}`,
    );
    const nonce = nonceRes.body.nonce;
    const signature = await wallet.signData(nonce, walletAddress);

    const loginRes = await request(API_URL).post('/auth/verify').send({
      address: walletAddress,
      signature: signature.signature,
      key: signature.key,
    });

    authCookie = loginRes.headers['set-cookie']?.[0] || '';
    console.log('Login:', authCookie ? 'OK' : 'FAILED');
  });

  async function signAndSubmit(unsignedTx: string): Promise<string> {
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    return txHash;
  }

  async function waitForConfirmation(txHash: string): Promise<void> {
    return new Promise((resolve) => {
      blockfrostProvider.onTxConfirmed(txHash, () => resolve());
    });
  }

  describe('Full Payment Flow', () => {
    let subscriptionId: string;

    it('1. Get available service plans', async () => {
      const res = await request(API_URL).get('/services');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      console.log(
        'Available services:',
        res.body.map((s: any) => `${s.id}: ${s.name} (${s.price} ADA)`),
      );
    });

    it('2. Create subscription (pending) for a service plan', async () => {
      if (!authCookie) {
        console.log('Skipping: No auth cookie');
        return;
      }

      // Create subscription with status pending
      const res = await request(API_URL)
        .post('/subscriptions')
        .set('Cookie', authCookie)
        .send({
          servicePlanId: 'starter',
          status: 'pending',
        });

      console.log('Create subscription response:', res.status, res.body);
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');

      subscriptionId = res.body.id;
      console.log('Created subscription:', subscriptionId);
    });

    it('3. Create payment transaction, sign, submit, and verify', async () => {
      if (!authCookie || !subscriptionId) {
        console.log('Skipping: No auth cookie or subscriptionId');
        return;
      }

      // Get service price
      const serviceRes = await request(API_URL).get('/services/starter');
      if (serviceRes.status !== 200) {
        console.log('Skipping: Starter service not found');
        return;
      }
      const service = serviceRes.body;
      const amountLovelace = (service.price * 1_000_000).toString();

      console.log(`Creating payment tx for ${service.price} ADA...`);

      // 1. Create unsigned payment tx from backend
      const createTxRes = await request(API_URL)
        .post('/contract/payment')
        .set('Cookie', authCookie)
        .send({
          walletAddress,
          amount: amountLovelace,
        });

      console.log(
        'Create payment tx response:',
        createTxRes.status,
        createTxRes.body.result,
      );
      expect(createTxRes.status).toBe(201);
      expect(createTxRes.body.result).toBe(true);

      // 2. Sign and submit
      console.log('Signing and submitting tx...');
      const txHash = await signAndSubmit(createTxRes.body.data);
      console.log('txHash:', txHash);
      console.log(`https://preprod.cexplorer.io/tx/${txHash}`);

      // 3. Wait for confirmation
      console.log('Waiting for confirmation...');
      await waitForConfirmation(txHash);
      console.log('Transaction confirmed!');

      // 4. Verify payment and activate subscription
      console.log('Verifying payment on backend...');
      const verifyRes = await request(API_URL)
        .post('/payments')
        .set('Cookie', authCookie)
        .send({
          subscriptionId,
          txHash,
        });

      console.log('Verify response:', verifyRes.status, verifyRes.body);
      expect(verifyRes.status).toBe(201);
      expect(verifyRes.body.result).toBe(true);
      expect(verifyRes.body.message).toBe(
        'Payment verified and subscription activated',
      );
      expect(verifyRes.body.data.subscription.status).toBe('active');
    }, 180000);

    it('4. Get user payments', async () => {
      if (!authCookie) return;

      const res = await request(API_URL)
        .get('/payments')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      console.log('User payments:', res.body.length);
    });

    it('5. Get user subscriptions (should be active)', async () => {
      if (!authCookie) return;

      const res = await request(API_URL)
        .get('/subscriptions')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const activeSubscriptions = res.body.filter(
        (s: any) => s.status === 'active',
      );
      console.log('Active subscriptions:', activeSubscriptions.length);
    });

    afterAll(async () => {
      // Cleanup: Delete test subscription
      if (authCookie && subscriptionId) {
        await request(API_URL)
          .delete(`/subscriptions/${subscriptionId}`)
          .set('Cookie', authCookie);
        console.log('Cleaned up subscription:', subscriptionId);
      }
    });
  });
});
