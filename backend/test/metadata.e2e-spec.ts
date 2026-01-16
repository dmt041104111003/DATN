import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Metadata (e2e)', () => {
  let ctx: TestContext | null;
  let createdCollectionId: string;
  let createdMetadataId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
    
    if (ctx?.cookie) {
      const collectionRes = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Collection for Metadata Test',
          description: 'Test collection',
        }),
      });
      const collection = await collectionRes.json();
      createdCollectionId = collection.id;
    }
  });

  afterAll(async () => {
    // Cleanup collection
    if (ctx?.cookie && createdCollectionId) {
      await fetch(`${API_URL}/collections/${createdCollectionId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });
    }
  });

  describe('GET /metadata (public)', () => {
    it('tra ve danh sach metadata', async () => {
      const res = await fetch(`${API_URL}/metadata`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /metadata', () => {
    it('tao metadata thanh cong', async () => {
      if (!ctx?.cookie || !createdCollectionId) return;

      const res = await fetch(`${API_URL}/metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          collectionId: createdCollectionId,
          assetName: 'TestAsset001',
          content: JSON.stringify({ name: 'Test NFT', description: 'Test metadata' }),
          nftReference: ['ipfs://QmTest123'],
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.assetName).toBe('TestAsset001');

      createdMetadataId = data.id;
    });
  });

  describe('GET /metadata/:id', () => {
    it('tra ve metadata chi tiet', async () => {
      if (!ctx?.cookie || !createdMetadataId) return;

      const res = await fetch(`${API_URL}/metadata/${createdMetadataId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdMetadataId);
    });
  });

  describe('PATCH /metadata/:id', () => {
    it('cap nhat metadata thanh cong', async () => {
      if (!ctx?.cookie || !createdMetadataId) return;

      const res = await fetch(`${API_URL}/metadata/${createdMetadataId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          content: JSON.stringify({ name: 'Updated NFT', description: 'Updated metadata' }),
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.content).toContain('Updated NFT');
    });
  });

  describe('DELETE /metadata/:id', () => {
    it('xoa metadata thanh cong', async () => {
      if (!ctx?.cookie || !createdMetadataId) return;

      const res = await fetch(`${API_URL}/metadata/${createdMetadataId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
