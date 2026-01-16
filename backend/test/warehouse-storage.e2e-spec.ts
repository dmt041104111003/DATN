import {
  setupAuthenticatedContext,
  TestContext,
  API_URL,
} from './helpers/auth.helper';

describe('Warehouse Storage (e2e)', () => {
  let ctx: TestContext | null;
  let createdProductId: string;
  let createdWarehouseId: string;
  let createdStorageId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();

    if (ctx?.cookie) {
      const productRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Product for Storage Test',
          description: 'Test product',
        }),
      });
      const product = await productRes.json();
      createdProductId = product.id;

      const warehouseRes = await fetch(`${API_URL}/warehouses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Warehouse for Storage Test',
          location: 'Ha Noi',
        }),
      });
      const warehouse = await warehouseRes.json();
      createdWarehouseId = warehouse.id;
    }
  });

  afterAll(async () => {
    if (ctx?.cookie) {
      if (createdProductId) {
        await fetch(`${API_URL}/products/${createdProductId}`, {
          method: 'DELETE',
          headers: { Cookie: ctx.cookie },
        });
      }
      if (createdWarehouseId) {
        await fetch(`${API_URL}/warehouses/${createdWarehouseId}`, {
          method: 'DELETE',
          headers: { Cookie: ctx.cookie },
        });
      }
    }
  });

  describe('GET /warehouse-storages (public)', () => {
    it('tra ve danh sach storage', async () => {
      const res = await fetch(`${API_URL}/warehouse-storages`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /warehouse-storages', () => {
    it('tao storage thanh cong', async () => {
      if (!ctx?.cookie || !createdProductId || !createdWarehouseId) return;

      const res = await fetch(`${API_URL}/warehouse-storages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: ctx.cookie,
        },
        body: JSON.stringify({
          productId: createdProductId,
          warehouseId: createdWarehouseId,
          entryTime: new Date().toISOString(),
          conditions: 'Nhiet do 25C, do am 60%',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.conditions).toBe('Nhiet do 25C, do am 60%');

      createdStorageId = data.id;
    });
  });

  describe('GET /warehouse-storages/:id', () => {
    it('tra ve storage chi tiet', async () => {
      if (!ctx?.cookie || !createdStorageId) return;

      const res = await fetch(
        `${API_URL}/warehouse-storages/${createdStorageId}`,
        {
          headers: { Cookie: ctx.cookie },
        },
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdStorageId);
    });
  });

  describe('PATCH /warehouse-storages/:id', () => {
    it('cap nhat storage thanh cong', async () => {
      if (!ctx?.cookie || !createdStorageId) return;

      const res = await fetch(
        `${API_URL}/warehouse-storages/${createdStorageId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: ctx.cookie,
          },
          body: JSON.stringify({
            exitTime: new Date().toISOString(),
            conditions: 'Da xuat kho',
          }),
        },
      );

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.conditions).toBe('Da xuat kho');
    });
  });

  describe('DELETE /warehouse-storages/:id', () => {
    it('xoa storage thanh cong', async () => {
      if (!ctx?.cookie || !createdStorageId) return;

      const res = await fetch(
        `${API_URL}/warehouse-storages/${createdStorageId}`,
        {
          method: 'DELETE',
          headers: { Cookie: ctx.cookie },
        },
      );

      expect(res.status).toBe(200);
    });
  });
});
