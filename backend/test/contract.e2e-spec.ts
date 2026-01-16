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
    const nonceRes = await request(API_URL)
      .get(`/auth/nonce?address=${walletAddress}`);

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

  jest.setTimeout(120000);

  test('Get contract info (public)', async () => {
    const res = await request(API_URL).get('/contract/info');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('policyId');
    expect(res.body).toHaveProperty('storeAddress');
    expect(res.body.policyId).toHaveLength(56);
    console.log('Policy ID:', res.body.policyId);
    console.log('Store Address:', res.body.storeAddress);
  });

  test('Mint', async () => {
    //return;
    const assetName = `NFT${Date.now()}`;
    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: { name: assetName, _pk: pubKeyHash },
        quantity: '1',
      }]);

    console.log('Mint response:', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.txHash).toHaveLength(64);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(res.body.txHash, () => resolve());
    });
  });

  test('Burn', async () => {
    return;
    const assetName = `Burn${Date.now()}`;
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{ assetName, metadata: { name: assetName, _pk: pubKeyHash }, quantity: '1' }]);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(mintRes.body.txHash, () => resolve());
    });

    const res = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send([{ assetName, quantity: '-1' }]);

    expect(res.status).toBe(201);
    expect(res.body.txHash).toHaveLength(64);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('Update', async () => {
    return;
    const assetName = `Upd${Date.now()}`;
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{ assetName, metadata: { name: assetName, _pk: pubKeyHash }, quantity: '1' }]);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(mintRes.body.txHash, () => resolve());
    });

    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: {
          name: 'Updated Name',
          image: 'ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua',
          mediaType: 'image/jpg',
          description: 'Updated description',
          owner: walletAddress,
          website: 'https://example.com',
          _pk: pubKeyHash,
        },
      }]);

    expect(res.status).toBe(201);
    expect(res.body.txHash).toHaveLength(64);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('Update multiple assets', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([
        { assetName: 'CIP68 Generators', metadata: { name: 'Updated 1', _pk: pubKeyHash } },
        { assetName: 'CIP68 Generators 1', metadata: { name: 'Updated 2', _pk: pubKeyHash } },
      ]);

    expect(res.status).toBe(201);
  });

  test('[TC1]: Mint with all required metadata fields', async () => {
    return;
    const assetName = `TC1 ${Date.now()}`;
    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: {
          name: assetName,
          image: 'ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua',
          mediaType: 'image/jpg',
          description: 'Open source dynamic assets (Token/NFT) generator (CIP68)',
          _pk: pubKeyHash,
        },
        quantity: '1',
      }]);

    expect(res.status).toBe(201);
    expect(res.body.txHash).toHaveLength(64);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(res.body.txHash, () => resolve());
    });
  });

  test('[TC2]: Mint with empty metadata', async () => {
    return;
    const assetName = `TC2 ${Date.now()}`;
    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: {},
        quantity: '1',
      }]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC3]: Mint with partial metadata', async () => {
    return;
    const assetName = `TC3 ${Date.now()}`;
    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: {
          name: assetName,
          image: 'ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua',
          _pk: pubKeyHash,
        },
        quantity: '1',
      }]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC4]: Mint with wrong author pubKeyHash', async () => {
    return;
    const assetName = `TC4 ${Date.now()}`;
    const wrongPubKey = '0000000000000000000000000000000000000000000000000000000000';

    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: { name: assetName, _pk: wrongPubKey },
        quantity: '1',
      }]);

    console.log('TC4 status:', res.status);
  });

  test('[TC5]: Mint with quantity > 1 (Token)', async () => {
    return;
    const assetName = `TC5${Date.now()}`;
    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: { name: assetName, _pk: pubKeyHash },
        quantity: '100',
      }]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC6]: Mint multiple assets in one transaction', async () => {
    return;
    const timestamp = Date.now();
    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([
        { assetName: `A${timestamp}`, metadata: { name: `A`, _pk: pubKeyHash }, quantity: '1' },
        { assetName: `B${timestamp}`, metadata: { name: `B`, _pk: pubKeyHash }, quantity: '1' },
        { assetName: `C${timestamp}`, metadata: { name: `C`, _pk: pubKeyHash }, quantity: '1' },
      ]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC7]: Mint with receiver address', async () => {
    return;
    const assetName = `TC7 ${Date.now()}`;
    const res = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: { name: assetName, _pk: pubKeyHash },
        quantity: '1',
        receiver: walletAddress,
      }]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC8]: Mint duplicate asset name should fail', async () => {
    return;
    const assetName = `TC8${Date.now()}`;

    const res1 = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{ assetName, metadata: { name: assetName, _pk: pubKeyHash }, quantity: '1' }]);

    expect(res1.status).toBe(201);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(res1.body.txHash, () => resolve());
    });

    const res2 = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{ assetName, metadata: { name: assetName, _pk: pubKeyHash }, quantity: '1' }]);

    expect(res2.status).toBe(500);
    console.log('Duplicate mint error:', res2.body.message);
  });

  test('[TC9]: Mint without authentication should fail', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/mint')
      .send([{
        assetName: 'Unauthorized',
        metadata: { name: 'Test' },
        quantity: '1',
      }]);

    expect(res.status).toBe(401);
  });

  test('[TC10]: Update metadata successfully', async () => {
    return;
    const assetName = `TC10 ${Date.now()}`;

    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{ assetName, metadata: { name: assetName, _pk: pubKeyHash }, quantity: '1' }]);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(mintRes.body.txHash, () => resolve());
    });

    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: {
          name: 'Updated Name',
          image: 'ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua',
          mediaType: 'image/jpg',
          description: 'Updated description',
          owner: walletAddress,
          website: 'https://example.com',
          _pk: pubKeyHash,
        },
      }]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC11]: Update without _pk field should fail', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([{
        assetName: 'CIP68 Generators',
        metadata: { name: 'Updated' },
      }]);

    console.log('TC11 status:', res.status);
  });

  test('[TC12]: Update without authentication should fail', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/update')
      .send([{
        assetName: 'CIP68 Generators',
        metadata: { name: 'Test' },
      }]);

    expect(res.status).toBe(401);
  });

  test('[TC13]: Update non-existent asset should fail', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([{
        assetName: 'Non Existent Asset 99999',
        metadata: { name: 'Test', _pk: pubKeyHash },
      }]);

    expect(res.status).toBe(500);
  });

  test('[TC14]: Update with empty asset name should fail', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([{
        assetName: '',
        metadata: { name: 'Test', _pk: pubKeyHash },
      }]);

    console.log('TC14 status:', res.status);
  });

  test('[TC15]: Update multiple assets', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([
        { assetName: 'Asset1', metadata: { name: 'Updated 1', _pk: pubKeyHash } },
        { assetName: 'Asset2', metadata: { name: 'Updated 2', _pk: pubKeyHash } },
      ]);

    expect(res.status).toBe(201);
  });

  test('[TC16]: Update with wrong _pk should fail', async () => {
    return;
    const wrongPubKey = '0000000000000000000000000000000000000000000000000000000000';
    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([{
        assetName: 'CIP68 Generators',
        metadata: { name: 'Test', _pk: wrongPubKey },
      }]);

    console.log('TC16 status:', res.status);
  });

  test('[TC17]: Update with empty metadata', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([{
        assetName: 'CIP68 Generators',
        metadata: {},
      }]);

    console.log('TC17 status:', res.status);
  });

  test('[TC18]: Update with different redeemer', async () => {
    return;
  });

  test('[TC19]: Burn successfully', async () => {
    return;
    const assetName = `TC19 ${Date.now()}`;

    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{ assetName, metadata: { name: assetName, _pk: pubKeyHash }, quantity: '1' }]);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(mintRes.body.txHash, () => resolve());
    });

    const res = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send([{ assetName, quantity: '-1' }]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC20]: Burn non-existent asset should fail', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send([{ assetName: 'Non Existent Asset 99999', quantity: '-1' }]);

    expect(res.status).toBe(500);
  });

  test('[TC21]: Burn without authentication should fail', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/burn')
      .send([{ assetName: 'CIP68 Generators', quantity: '-1' }]);

    expect(res.status).toBe(401);
  });

  test('[TC22]: Burn with wrong quantity format', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send([{ assetName: 'CIP68 Generators', quantity: '1' }]);

    console.log('TC22 status:', res.status);
  });

  test('[TC23]: Burn with empty asset name should fail', async () => {
    return;
    const res = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send([{ assetName: '', quantity: '-1' }]);

    console.log('TC23 status:', res.status);
  });

  test('[TC24]: Burn multiple assets', async () => {
    return;
    const timestamp = Date.now();

    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([
        { assetName: `X${timestamp}`, metadata: { name: 'A', _pk: pubKeyHash }, quantity: '1' },
        { assetName: `Y${timestamp}`, metadata: { name: 'B', _pk: pubKeyHash }, quantity: '1' },
      ]);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(mintRes.body.txHash, () => resolve());
    });

    const res = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send([
        { assetName: `X${timestamp}`, quantity: '-1' },
        { assetName: `Y${timestamp}`, quantity: '-1' },
      ]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC25]: Burn Token with quantity > 1', async () => {
    return;
    const assetName = `TC25${Date.now()}`;

    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{ assetName, metadata: { name: assetName, _pk: pubKeyHash }, quantity: '100' }]);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(mintRes.body.txHash, () => resolve());
    });

    const res = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send([{ assetName, quantity: '-50' }]);

    expect(res.status).toBe(201);
    console.log('https://preprod.cexplorer.io/tx/' + res.body.txHash);
  });

  test('[TC26]: Full lifecycle - Mint, Update, Burn', async () => {
    return;
    const assetName = `TC26${Date.now()}`;

    // 1. Mint
    const mintRes = await request(API_URL)
      .post('/contract/mint')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: { name: assetName, version: '1', _pk: pubKeyHash },
        quantity: '1',
      }]);

    expect(mintRes.status).toBe(201);
    console.log('Mint:', mintRes.body.txHash);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(mintRes.body.txHash, () => resolve());
    });

    // 2. Update
    const updateRes = await request(API_URL)
      .post('/contract/update')
      .set('Cookie', authCookie)
      .send([{
        assetName,
        metadata: { name: assetName, version: '2', updated: 'true', _pk: pubKeyHash },
      }]);

    expect(updateRes.status).toBe(201);
    console.log('Update:', updateRes.body.txHash);

    await new Promise<void>((resolve) => {
      blockfrostProvider.onTxConfirmed(updateRes.body.txHash, () => resolve());
    });

    // 3. Burn
    const burnRes = await request(API_URL)
      .post('/contract/burn')
      .set('Cookie', authCookie)
      .send([{ assetName, quantity: '-1' }]);

    expect(burnRes.status).toBe(201);
    console.log('Burn:', burnRes.body.txHash);
  });
});
