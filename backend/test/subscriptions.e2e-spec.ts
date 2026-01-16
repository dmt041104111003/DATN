import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Subscriptions (e2e)', () => {
  let ctx: TestContext | null;
  let createdSubscriptionId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
  });

  describe('GET /subscriptions (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/subscriptions`);
      expect(res.status).toBe(401);
    });

    it('tra ve danh sach subscriptions cua user', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/subscriptions`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /subscriptions', () => {
    it('tao subscription thanh cong', async () => {
      if (!ctx?.cookie) return;

      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          servicePlanId: 'starter',
          startDate,
          endDate,
          status: 'pending',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.servicePlanId).toBe('starter');
      expect(data.status).toBe('pending');

      createdSubscriptionId = data.id;
    });
  });

  describe('PATCH /subscriptions/:id', () => {
    it('cap nhat subscription thanh cong', async () => {
      if (!ctx?.cookie || !createdSubscriptionId) return;

      const res = await fetch(`${API_URL}/subscriptions/${createdSubscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          status: 'active',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe('active');
    });
  });

  describe('DELETE /subscriptions/:id', () => {
    it('xoa subscription thanh cong', async () => {
      if (!ctx?.cookie || !createdSubscriptionId) return;

      const res = await fetch(`${API_URL}/subscriptions/${createdSubscriptionId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
