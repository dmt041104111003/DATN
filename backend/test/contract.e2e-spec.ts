import { describe, test, expect, beforeAll, jest } from '@jest/globals';
import { deserializeAddress, MeshWallet, BlockfrostProvider } from '@meshsdk/core';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000'; //BE
const blockfrostProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || '');

describe('Contract API - Mint, Burn, Update CIP68', () => {
  let wallet: MeshWallet;
  let authCookie: string;
  let walletAddress: string;
  let pubKeyHash: string;

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
    pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

    // Login
    const nonceRes = await request(API_URL).get(`/auth/nonce?address=${walletAddress}`);
    const nonce = nonceRes.body.nonce;
    const signature = await wallet.signData(nonce, walletAddress);

    const loginRes = await request(API_URL)
      .post('/auth/verify')
      .send({
        address: walletAddress,
        signature: signature.signature,
        key: signature.key,
      });

    authCookie = loginRes.headers['set-cookie']?.[0] || '';
  });

  jest.setTimeout(180000);

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

  test('Get contract info (public)', async () => {
    const res = await request(API_URL).get(`/contract/info?walletAddress=${walletAddress}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('policyId');
    expect(res.body).toHaveProperty('storeAddress');
    expect(res.body.policyId).toHaveLength(56);
    console.log('Policy ID:', res.body.policyId);
    console.log('Store Address:', res.body.storeAddress);
  });

  test('Mint', async () => {
    const assetName = `NFT${Date.now()}`;

    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        assets: [{
          assetName,
          metadata: {
            name: assetName,
            image: 'ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua',
            mediaType: 'image/jpg',
            description: 'Test NFT',
          },
          quantity: '1',
        }],
      });

    console.log('Mint response:', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body.data).toBeDefined();

    // 2. Sign and submit
    const txHash = await signAndSubmit(res.body.data);
    expect(txHash).toHaveLength(64);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);

    // 3. Wait for confirmation
    await waitForConfirmation(txHash);
    console.log('Mint confirmed!');
  });

  test('Update', async () => {
    return; // Skip for now
    const assetName = `Upd${Date.now()}`;

    // Mint first
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        assets: [{ assetName, metadata: { name: assetName }, quantity: '1' }],
      });

    const mintTxHash = await signAndSubmit(mintRes.body.data);
    await waitForConfirmation(mintTxHash);

    // Update
    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        assets: [{
          assetName,
          metadata: {
            name: 'Updated Name',
            description: 'Updated description',
          },
        }],
      });

    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);

    const txHash = await signAndSubmit(res.body.data);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
  });

  test('Burn', async () => {
    return; // Skip for now
    const assetName = `Burn${Date.now()}`;

    // Mint first
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        assets: [{ assetName, metadata: { name: assetName }, quantity: '1' }],
      });

    const mintTxHash = await signAndSubmit(mintRes.body.data);
    await waitForConfirmation(mintTxHash);

    // Burn
    const res = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        assets: [{ assetName, quantity: '-1' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);

    const txHash = await signAndSubmit(res.body.data);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
  });

  test('Payment', async () => {
    return; // Skip for now
    const res = await request(API_URL)
      .post('/contract/payment')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        amount: '5000000', // 5 ADA
      });

    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);

    const txHash = await signAndSubmit(res.body.data);
    console.log('Payment tx:', txHash);
  });

  test('[TC1]: Full lifecycle - Mint, Update, Burn', async () => {
    return; // Skip for now
    const assetName = `TC1${Date.now()}`;

    // 1. Mint
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        assets: [{
          assetName,
          metadata: { name: assetName, version: '1' },
          quantity: '1',
        }],
      });

    const mintTxHash = await signAndSubmit(mintRes.body.data);
    console.log('Mint:', mintTxHash);
    await waitForConfirmation(mintTxHash);

    // 2. Update
    const updateRes = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        assets: [{
          assetName,
          metadata: { name: assetName, version: '2', updated: 'true' },
        }],
      });

    const updateTxHash = await signAndSubmit(updateRes.body.data);
    console.log('Update:', updateTxHash);
    await waitForConfirmation(updateTxHash);

    // 3. Burn
    const burnRes = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send({
        walletAddress,
        assets: [{ assetName, quantity: '-1' }],
      });

    const burnTxHash = await signAndSubmit(burnRes.body.data);
    console.log('Burn:', burnTxHash);
  });
});
