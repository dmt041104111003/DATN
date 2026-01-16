import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Product Materials (e2e)', () => {
  let ctx: TestContext | null;
  let createdProductId: string;
  let createdSupplierId: string;
  let createdMaterialId: string;
  let createdProductMaterialId: string;

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
          name: 'Product for Material Link Test',
          description: 'Test product',
        }),
      });
      const product = await productRes.json();
      createdProductId = product.id;

      const supplierRes = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Supplier for Material Link Test',
          location: 'Vietnam',
        }),
      });
      const supplier = await supplierRes.json();
      createdSupplierId = supplier.id;

      const materialRes = await fetch(`${API_URL}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          supplierId: createdSupplierId,
          name: 'Material for Link Test',
          quantity: 100,
        }),
      });
      const material = await materialRes.json();
      createdMaterialId = material.id;
    }
  });

  afterAll(async () => {
    if (ctx?.cookie) {
      if (createdMaterialId) {
        await fetch(`${API_URL}/materials/${createdMaterialId}`, {
          method: 'DELETE',
          headers: { 'Cookie': ctx.cookie },
        });
      }
      if (createdSupplierId) {
        await fetch(`${API_URL}/suppliers/${createdSupplierId}`, {
          method: 'DELETE',
          headers: { 'Cookie': ctx.cookie },
        });
      }
      if (createdProductId) {
        await fetch(`${API_URL}/products/${createdProductId}`, {
          method: 'DELETE',
          headers: { 'Cookie': ctx.cookie },
        });
      }
    }
  });

  describe('GET /product-materials (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/product-materials?productId=test`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach product-materials theo productId', async () => {
      if (!ctx?.cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/product-materials?productId=${createdProductId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /product-materials', () => {
    it('gan material vao product thanh cong', async () => {
      if (!ctx?.cookie || !createdProductId || !createdMaterialId) return;

      const res = await fetch(`${API_URL}/product-materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          productId: createdProductId,
          materialId: createdMaterialId,
          quantity: 50,
          unit: 'kg',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.quantity).toBe(50);
      expect(data.unit).toBe('kg');

      createdProductMaterialId = data.id;
    });
  });

  describe('GET /product-materials/:id', () => {
    it('tra ve product-material chi tiet', async () => {
      if (!ctx?.cookie || !createdProductMaterialId) return;

      const res = await fetch(`${API_URL}/product-materials/${createdProductMaterialId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdProductMaterialId);
      expect(data.material).toBeDefined();
      expect(data.material.supplier).toBeDefined();
    });
  });

  describe('PATCH /product-materials/:id', () => {
    it('cap nhat product-material thanh cong', async () => {
      if (!ctx?.cookie || !createdProductMaterialId) return;

      const res = await fetch(`${API_URL}/product-materials/${createdProductMaterialId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          quantity: 75,
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.quantity).toBe(75);
    });
  });

  describe('DELETE /product-materials/:id', () => {
    it('xoa product-material thanh cong', async () => {
      if (!ctx?.cookie || !createdProductMaterialId) return;

      const res = await fetch(`${API_URL}/product-materials/${createdProductMaterialId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
