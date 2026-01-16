import { describe, test, expect, beforeAll, jest } from '@jest/globals';
import { MeshWallet, BlockfrostProvider } from '@meshsdk/core';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000'; //BE
const blockfrostProvider = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY || '',
);

describe('Contract API - Mint, Burn, Update CIP68', () => {
  let wallet: MeshWallet;
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
    console.log('Wallet:', walletAddress);
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

  test('Get contract info', async () => {
    const res = await request(API_URL).get(
      `/contract/info?walletAddress=${walletAddress}`,
    );
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
      .send({
        walletAddress,
        assets: [
          {
            assetName,
            metadata: {
              name: assetName,
              image: 'ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua',
              mediaType: 'image/jpg',
              description: 'Test NFT',
            },
            quantity: '1',
          },
        ],
      });

    console.log('Mint response:', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body.data).toBeDefined();

    const txHash = await signAndSubmit(res.body.data);
    expect(txHash).toHaveLength(64);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);

    await waitForConfirmation(txHash);
    console.log('Mint confirmed!');
  });

  test('Update', async () => {
    return;
    const assetName = `Upd${Date.now()}`;

    // Mint first
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .send({
        walletAddress,
        assets: [{ assetName, metadata: { name: assetName }, quantity: '1' }],
      });

    const mintTxHash = await signAndSubmit(mintRes.body.data);
    await waitForConfirmation(mintTxHash);

    // Update
    const res = await request(API_URL)
      .post('/contract/update')
      .send({
        walletAddress,
        assets: [
          {
            assetName,
            metadata: {
              name: 'Updated Name',
              description: 'Updated description',
            },
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);

    const txHash = await signAndSubmit(res.body.data);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
  });

  test('Burn', async () => {
    return;
    const assetName = `Burn${Date.now()}`;

    // Mint first
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .send({
        walletAddress,
        assets: [{ assetName, metadata: { name: assetName }, quantity: '1' }],
      });

    const mintTxHash = await signAndSubmit(mintRes.body.data);
    await waitForConfirmation(mintTxHash);

    // Burn
    const res = await request(API_URL)
      .post('/contract/burn')
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
    return;
    const res = await request(API_URL).post('/contract/payment').send({
      walletAddress,
      amount: '5000000', // 5 ADA
    });

    console.log('Payment response:', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body.data).toBeDefined();

    const txHash = await signAndSubmit(res.body.data);
    console.log('Payment tx:', txHash);
  });

  test('Full lifecycle - Mint, Update, Burn', async () => {
    return;
    const assetName = `LC${Date.now()}`;

    // 1. Mint
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .send({
        walletAddress,
        assets: [
          {
            assetName,
            metadata: { name: assetName, version: '1' },
            quantity: '1',
          },
        ],
      });

    const mintTxHash = await signAndSubmit(mintRes.body.data);
    console.log('Mint:', mintTxHash);
    await waitForConfirmation(mintTxHash);

    // 2. Update
    const updateRes = await request(API_URL)
      .post('/contract/update')
      .send({
        walletAddress,
        assets: [
          {
            assetName,
            metadata: { name: assetName, version: '2', updated: 'true' },
          },
        ],
      });

    const updateTxHash = await signAndSubmit(updateRes.body.data);
    console.log('Update:', updateTxHash);
    await waitForConfirmation(updateTxHash);

    // 3. Burn
    const burnRes = await request(API_URL)
      .post('/contract/burn')
      .send({
        walletAddress,
        assets: [{ assetName, quantity: '-1' }],
      });

    const burnTxHash = await signAndSubmit(burnRes.body.data);
    console.log('Burn:', burnTxHash);
  });
});
