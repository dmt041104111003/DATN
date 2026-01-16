import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Warehouses (e2e)', () => {
  let ctx: TestContext | null;
  let createdWarehouseId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
  });

  describe('GET /warehouses (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/warehouses`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach warehouses cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/warehouses`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /warehouses', () => {
    it('tao warehouse thanh cong', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/warehouses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Test Warehouse E2E',
          location: 'Ha Noi',
          capacity: 1000,
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.name).toBe('Test Warehouse E2E');

      createdWarehouseId = data.id;
    });
  });

  describe('GET /warehouses/:id', () => {
    it('tra ve warehouse chi tiet', async () => {
      if (!ctx?.cookie || !createdWarehouseId) return;

      const res = await fetch(`${API_URL}/warehouses/${createdWarehouseId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdWarehouseId);
    });
  });

  describe('PATCH /warehouses/:id', () => {
    it('cap nhat warehouse thanh cong', async () => {
      if (!ctx?.cookie || !createdWarehouseId) return;

      const res = await fetch(`${API_URL}/warehouses/${createdWarehouseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Updated Warehouse E2E',
          capacity: 2000,
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Warehouse E2E');
    });
  });

  describe('DELETE /warehouses/:id', () => {
    it('xoa warehouse thanh cong', async () => {
      if (!ctx?.cookie || !createdWarehouseId) return;

      const res = await fetch(`${API_URL}/warehouses/${createdWarehouseId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
