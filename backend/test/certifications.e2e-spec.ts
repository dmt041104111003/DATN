import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Certifications (e2e)', () => {
  let ctx: TestContext | null;
  let createdProductId: string;
  let createdCertificationId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
    
    if (ctx?.cookie) {
      const productRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Product for Certification Test',
          description: 'Test product',
        }),
      });
      const product = await productRes.json();
      createdProductId = product.id;
    }
  });

  afterAll(async () => {
    if (ctx?.cookie && createdProductId) {
      await fetch(`${API_URL}/products/${createdProductId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });
    }
  });

  describe('GET /certifications (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/certifications`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach certifications cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/certifications`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /certifications', () => {
    it('tao certification thanh cong', async () => {
      if (!ctx?.cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/certifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          productId: createdProductId,
          certName: 'ISO 9001',
          issueDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          certHash: 'certHashTest123',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.certName).toBe('ISO 9001');

      createdCertificationId = data.id;
    });
  });

  describe('GET /certifications/:id', () => {
    it('tra ve certification chi tiet', async () => {
      if (!ctx?.cookie || !createdCertificationId) return;

      const res = await fetch(`${API_URL}/certifications/${createdCertificationId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdCertificationId);
    });
  });

  describe('PATCH /certifications/:id', () => {
    it('cap nhat certification thanh cong', async () => {
      if (!ctx?.cookie || !createdCertificationId) return;

      const res = await fetch(`${API_URL}/certifications/${createdCertificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          certName: 'ISO 14001',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.certName).toBe('ISO 14001');
    });
  });

  describe('DELETE /certifications/:id', () => {
    it('xoa certification thanh cong', async () => {
      if (!ctx?.cookie || !createdCertificationId) return;

      const res = await fetch(`${API_URL}/certifications/${createdCertificationId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
