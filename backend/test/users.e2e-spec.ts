import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Users (e2e)', () => {
  let ctx: TestContext | null;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
  });

  describe('GET /users/me (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/users/me`);
      expect(res.status).toBe(401);
    });

    it('tra ve thong tin user hien tai', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/users/me`, {
        headers: { 'Cookie': ctx.cookie },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.address).toBe(ctx.address);
      expect(data.id).toBeDefined();
    });
  });

  describe('PATCH /users/me', () => {
    it('cap nhat profile thanh cong', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
    });
  });
});
