import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';
import * as fs from 'fs';
import * as path from 'path';

describe('Media (e2e)', () => {
  let ctx: TestContext | null;
  let createdMediaId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
  });

  describe('GET /media (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/media`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach media khi da login', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/media`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /media/upload (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');

      const res = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(401);
    });

    it('loi 400 khi khong co file', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(400);
    });

    it('upload file thanh cong (skip if no PINATA keys)', async () => {
      if (!ctx?.cookie) return;
      if (!process.env.PINATA_API_KEY) {
        console.log('Skipping IPFS upload test - PINATA_API_KEY not set');
        return;
      }

      const filePath = path.join(__dirname, '../public/demo.png');
      const fileBuffer = fs.readFileSync(filePath);

      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer], { type: 'image/png' }), 'demo.png');

      const res = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: { 'Cookie': ctx.cookie },
        body: formData,
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.url).toMatch(/^ipfs:\/\//);
      expect(data.cid).toBeDefined();
      expect(data.gatewayUrl).toContain('pinata.cloud');

      createdMediaId = data.id;
      console.log('Uploaded media:', data);
    });
  });

  describe('GET /media/:id (protected)', () => {
    it('tra ve chi tiet media', async () => {
      if (!ctx?.cookie || !createdMediaId) return;

      const res = await fetch(`${API_URL}/media/${createdMediaId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdMediaId);
      expect(data.gatewayUrl).toBeDefined();
    });
  });

  describe('DELETE /media/:id (protected)', () => {
    it('xoa media thanh cong', async () => {
      if (!ctx?.cookie || !createdMediaId) return;

      const res = await fetch(`${API_URL}/media/${createdMediaId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
