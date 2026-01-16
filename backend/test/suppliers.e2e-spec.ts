import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Suppliers (e2e)', () => {
  let ctx: TestContext | null;
  let createdSupplierId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
  });

  describe('GET /suppliers (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/suppliers`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach suppliers cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/suppliers`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /suppliers', () => {
    it('tao supplier thanh cong', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Test Supplier E2E',
          location: 'Vietnam',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.name).toBe('Test Supplier E2E');

      createdSupplierId = data.id;
    });
  });

  describe('PATCH /suppliers/:id', () => {
    it('cap nhat supplier thanh cong', async () => {
      if (!ctx?.cookie || !createdSupplierId) return;

      const res = await fetch(`${API_URL}/suppliers/${createdSupplierId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Updated Supplier E2E',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Supplier E2E');
    });
  });

  describe('DELETE /suppliers/:id', () => {
    it('xoa supplier thanh cong', async () => {
      if (!ctx?.cookie || !createdSupplierId) return;

      const res = await fetch(`${API_URL}/suppliers/${createdSupplierId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
