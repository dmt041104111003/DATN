import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../.env') });

import { MeshWallet, BlockfrostProvider } from '@meshsdk/core';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export interface TestContext {
  wallet: MeshWallet;
  address: string;
  cookie: string;
  blockfrostProvider?: BlockfrostProvider;
}

export async function setupTestWallet(): Promise<TestContext | null> {
  if (!process.env.APP_MNEMONIC) {
    console.log('Skip: APP_MNEMONIC not set');
    return null;
  }

  const blockfrostProvider = process.env.BLOCKFROST_API_KEY
    ? new BlockfrostProvider(process.env.BLOCKFROST_API_KEY)
    : undefined;

  const wallet = new MeshWallet({
    networkId: (Number(process.env.NEXT_PUBLIC_APP_NETWORK) || 0) as 0 | 1,
    key: { type: 'mnemonic', words: process.env.APP_MNEMONIC.split(' ') },
    fetcher: blockfrostProvider,
    submitter: blockfrostProvider,
  });

  const address = (await wallet.getChangeAddress()).toString();

  return { wallet, address, cookie: '', blockfrostProvider };
}

export async function login(ctx: TestContext): Promise<string> {
  // Get nonce
  const nonceRes = await fetch(`${API_URL}/auth/nonce?address=${ctx.address}`);
  const { nonce } = await nonceRes.json();

  // Sign nonce
  const signedData = await ctx.wallet.signData(nonce, ctx.address);

  // Verify
  const verifyRes = await fetch(`${API_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: ctx.address,
      signature: signedData.signature,
      key: signedData.key,
    }),
  });

  if (!verifyRes.ok) {
    const error = await verifyRes.json();
    throw new Error(`Login failed: ${JSON.stringify(error)}`);
  }

  const cookie = verifyRes.headers.get('set-cookie') || '';
  ctx.cookie = cookie;

  return cookie;
}

export async function setupAuthenticatedContext(): Promise<TestContext | null> {
  const ctx = await setupTestWallet();
  if (!ctx) return null;

  await login(ctx);
  return ctx;
}

export { API_URL };
