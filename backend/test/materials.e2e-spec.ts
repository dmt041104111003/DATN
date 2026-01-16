import {
  setupAuthenticatedContext,
  TestContext,
  API_URL,
} from './helpers/auth.helper';

describe('Materials (e2e)', () => {
  let ctx: TestContext | null;
  let createdSupplierId: string;
  let createdMaterialId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();

    // Tạo supplier trước để có supplierId
    if (ctx?.cookie) {
      const supplierRes = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Supplier for Material Test',
          location: 'Vietnam',
        }),
      });
      const supplier = await supplierRes.json();
      createdSupplierId = supplier.id;
    }
  });

  afterAll(async () => {
    if (ctx?.cookie && createdSupplierId) {
      await fetch(`${API_URL}/suppliers/${createdSupplierId}`, {
        method: 'DELETE',
        headers: { Cookie: ctx.cookie },
      });
    }
  });

  describe('GET /materials (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/materials`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach materials cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/materials`, {
        headers: { Cookie: ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /materials', () => {
    it('tao material thanh cong', async () => {
      if (!ctx?.cookie || !createdSupplierId) return;

      const res = await fetch(`${API_URL}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: ctx.cookie,
        },
        body: JSON.stringify({
          supplierId: createdSupplierId,
          name: 'Test Material E2E',
          quantity: 100,
          harvestDate: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.name).toBe('Test Material E2E');

      createdMaterialId = data.id;
    });
  });

  describe('GET /materials/:id', () => {
    it('tra ve material chi tiet', async () => {
      if (!ctx?.cookie || !createdMaterialId) return;

      const res = await fetch(`${API_URL}/materials/${createdMaterialId}`, {
        headers: { Cookie: ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdMaterialId);
    });
  });

  describe('PATCH /materials/:id', () => {
    it('cap nhat material thanh cong', async () => {
      if (!ctx?.cookie || !createdMaterialId) return;

      const res = await fetch(`${API_URL}/materials/${createdMaterialId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Updated Material E2E',
          quantity: 200,
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Material E2E');
    });
  });

  describe('DELETE /materials/:id', () => {
    it('xoa material thanh cong', async () => {
      if (!ctx?.cookie || !createdMaterialId) return;

      const res = await fetch(`${API_URL}/materials/${createdMaterialId}`, {
        method: 'DELETE',
        headers: { Cookie: ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
