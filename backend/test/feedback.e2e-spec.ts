import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Feedback (e2e)', () => {
  let ctx: TestContext | null;
  let createdProductId: string;
  let createdFeedbackId: string;

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
          name: 'Product for Feedback Test',
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

  describe('GET /feedback (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/feedback`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach feedback cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/feedback`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /feedback', () => {
    it('tao feedback thanh cong', async () => {
      if (!ctx?.cookie || !createdProductId) return;

      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          productId: createdProductId,
          content: 'San pham chat luong tot!',
          rating: 5,
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.content).toBe('San pham chat luong tot!');
      expect(data.rating).toBe(5);

      createdFeedbackId = data.id;
    });
  });

  describe('GET /feedback/:id', () => {
    it('tra ve feedback chi tiet', async () => {
      if (!ctx?.cookie || !createdFeedbackId) return;

      const res = await fetch(`${API_URL}/feedback/${createdFeedbackId}`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(createdFeedbackId);
    });
  });

  describe('PATCH /feedback/:id', () => {
    it('cap nhat feedback thanh cong', async () => {
      if (!ctx?.cookie || !createdFeedbackId) return;

      const res = await fetch(`${API_URL}/feedback/${createdFeedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          content: 'San pham tuyet voi!',
          rating: 4,
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.content).toBe('San pham tuyet voi!');
    });
  });

  describe('DELETE /feedback/:id', () => {
    it('xoa feedback thanh cong', async () => {
      if (!ctx?.cookie || !createdFeedbackId) return;

      const res = await fetch(`${API_URL}/feedback/${createdFeedbackId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
