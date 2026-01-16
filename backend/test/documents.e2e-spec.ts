import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Documents (e2e)', () => {
  let ctx: TestContext | null;
  let createdProductId: string;
  let createdDocumentId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
    
    // Tạo product trước để có productId
    if (ctx?.cookie) {
      const productRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Product for Document Test',
          description: 'Test product',
        }),
      });
      const product = await productRes.json();
      createdProductId = product.id;
    }
  });

  afterAll(async () => {
    // Cleanup product
    if (ctx?.cookie && createdProductId) {
      await fetch(`${API_URL}/products/${createdProductId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });
    }
  });

  describe('GET /documents (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/documents`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach documents cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/documents`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /documents', () => {
    it('tao document thanh cong', async () => {
      if (!ctx?.cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          productId: createdProductId,
          docType: 'certificate',
          url: 'ipfs://QmTest123',
          hash: 'abc123hash',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.docType).toBe('certificate');

      createdDocumentId = data.id;
    });
  });

  describe('GET /documents/:id', () => {
    it('tra ve document chi tiet', async () => {
      if (!ctx?.cookie || !createdDocumentId) return;

      const res = await fetch(`${API_URL}/documents/${createdDocumentId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdDocumentId);
    });
  });

  describe('PATCH /documents/:id', () => {
    it('cap nhat document thanh cong', async () => {
      if (!ctx?.cookie || !createdDocumentId) return;

      const res = await fetch(`${API_URL}/documents/${createdDocumentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          docType: 'manual',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.docType).toBe('manual');
    });
  });

  describe('DELETE /documents/:id', () => {
    it('xoa document thanh cong', async () => {
      if (!ctx?.cookie || !createdDocumentId) return;

      const res = await fetch(`${API_URL}/documents/${createdDocumentId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
