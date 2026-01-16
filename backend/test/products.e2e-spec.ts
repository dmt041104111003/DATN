import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Products (e2e)', () => {
  let ctx: TestContext | null;
  let createdProductId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
  });

  describe('GET /products (public)', () => {
    it('tra ve danh sach san pham', async () => {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /products (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Product' }),
      });

      expect(res.status).toBe(401);
    });

    it('tao san pham thanh cong khi da login', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Test Product E2E',
          description: 'Created by E2E test',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.name).toBe('Test Product E2E');
      expect(data.id).toBeDefined();

      createdProductId = data.id;
    });
  });

  describe('GET /products/:id (public)', () => {
    it('tra ve chi tiet san pham', async () => {
      if (!createdProductId) return;

      const res = await fetch(`${API_URL}/products/${createdProductId}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdProductId);
    });
  });

  describe('PATCH /products/:id (protected)', () => {
    it('cap nhat san pham thanh cong', async () => {
      if (!ctx?.cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/products/${createdProductId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Updated Product E2E',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Product E2E');
    });
  });

  describe('DELETE /products/:id (protected)', () => {
    it('xoa san pham thanh cong', async () => {
      if (!ctx?.cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/products/${createdProductId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /products/quota (protected)', () => {
    it('tra ve quota cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/products/quota`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.tier).toBeDefined();
      expect(data.maxProducts).toBeDefined();
      expect(data.usedProducts).toBeDefined();
      expect(data.remainingProducts).toBeDefined();

      console.log('Quota:', data);
    });
  });
});
