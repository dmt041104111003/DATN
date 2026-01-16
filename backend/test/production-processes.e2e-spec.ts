import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Production Processes (e2e)', () => {
  let ctx: TestContext | null;
  let createdProductId: string;
  let createdProcessId: string;

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
          name: 'Product for Process Test',
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

  describe('GET /production-processes (public)', () => {
    it('tra ve danh sach processes', async () => {
      const res = await fetch(`${API_URL}/production-processes`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /production-processes', () => {
    it('tao process thanh cong', async () => {
      if (!ctx?.cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/production-processes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          productId: createdProductId,
          stepName: 'Thu hoach',
          startTime: new Date().toISOString(),
          location: 'Ha Noi',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.stepName).toBe('Thu hoach');

      createdProcessId = data.id;
    });
  });

  describe('GET /production-processes/:id', () => {
    it('tra ve process chi tiet', async () => {
      if (!ctx?.cookie || !createdProcessId) return;

      const res = await fetch(`${API_URL}/production-processes/${createdProcessId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdProcessId);
    });
  });

  describe('PATCH /production-processes/:id', () => {
    it('cap nhat process thanh cong', async () => {
      if (!ctx?.cookie || !createdProcessId) return;

      const res = await fetch(`${API_URL}/production-processes/${createdProcessId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          stepName: 'Che bien',
          endTime: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.stepName).toBe('Che bien');
    });
  });

  describe('DELETE /production-processes/:id', () => {
    it('xoa process thanh cong', async () => {
      if (!ctx?.cookie || !createdProcessId) return;

      const res = await fetch(`${API_URL}/production-processes/${createdProcessId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
