import { Transaction } from '@meshsdk/core';
import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Payment Flow (e2e)', () => {
  let ctx: TestContext | null;
  let subscriptionId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
    if (ctx) {
      console.log('Test wallet:', ctx.address);
      console.log('Login:', ctx.cookie ? 'OK' : 'FAILED');
    }
  });

  describe('Full Payment Flow with Real Transaction', () => {
    it('1. Tao subscription pending', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          servicePlanId: 'starter',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        }),
      });

      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.status).toBe('pending');

      subscriptionId = data.id;
      console.log('Created subscription:', subscriptionId);
    });

    it('2. Gui ADA va verify payment', async () => {
      if (!ctx?.cookie || !subscriptionId) {
        throw new Error('Missing context or subscriptionId');
      }
      if (!process.env.BLOCKFROST_API_KEY || !process.env.APP_WALLET_ADDRESS) {
        throw new Error('Missing BLOCKFROST_API_KEY or APP_WALLET_ADDRESS');
      }

      // Get service price
      const serviceRes = await fetch(`${API_URL}/services/starter`);
      const service = await serviceRes.json();
      const amountADA = service.price;

      console.log(`Sending ${amountADA} ADA to ${process.env.APP_WALLET_ADDRESS}...`);

      // Build & submit transaction
      const tx = new Transaction({ initiator: ctx.wallet });
      tx.sendLovelace(process.env.APP_WALLET_ADDRESS, (amountADA * 1_000_000).toString());

      const unsignedTx = await tx.build();
      const signedTx = await ctx.wallet.signTx(unsignedTx);
      const txHash = await ctx.wallet.submitTx(signedTx);

      console.log('txHash:', txHash);
      const network = process.env.NEXT_PUBLIC_APP_NETWORK === '1' ? '' : 'preprod.';
      console.log(`https://${network}cexplorer.io/tx/${txHash}`);

      // Wait for confirmation using blockfrostProvider
      console.log('Waiting for confirmation...');
      await new Promise<void>((resolve) => {
        ctx!.blockfrostProvider!.onTxConfirmed(txHash, () => {
          console.log('Transaction confirmed!');
          resolve();
        });
      });

      // Verify payment on backend
      const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({ subscriptionId, txHash }),
      });

      const data = await res.json();
      console.log('Payment response:', data);

      expect(res.status).toBe(201);
      expect(data.message).toBe('Payment verified and subscription activated');
      expect(data.subscription.status).toBe('active');
    }, 180000);

    it('3. Xem payments cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/payments`, {
        headers: { 'Cookie': ctx.cookie },
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);

      console.log('User payments:', data.length);
    });

    afterAll(async () => {
      if (!ctx?.cookie || !subscriptionId) return;
      await fetch(`${API_URL}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });
    });
  });
});
