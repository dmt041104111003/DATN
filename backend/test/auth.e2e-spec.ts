import { setupTestWallet, login, TestContext, API_URL } from './helpers/auth.helper';

describe('Auth Flow (e2e)', () => {
  let ctx: TestContext | null;

  beforeAll(async () => {
    ctx = await setupTestWallet();
    if (ctx) {
      console.log('address:', ctx.address);
    }
  });

  describe('GET /auth/nonce', () => {
    it('tra ve nonce khi co address hop le', async () => {
      if (!ctx) return;

      const res = await fetch(`${API_URL}/auth/nonce?address=${ctx.address}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.nonce).toBeDefined();
      expect(typeof data.nonce).toBe('string');

      console.log('nonce:', data.nonce);
    });

    it('loi 400 khi khong co address', async () => {
      const res = await fetch(`${API_URL}/auth/nonce`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/verify', () => {
    it('login thanh cong voi signature hop le', async () => {
      if (!ctx) return;

      // Login using helper
      const cookie = await login(ctx);

      expect(cookie).toBeDefined();
      expect(cookie.length).toBeGreaterThan(0);

      console.log('Login successful, cookie set');
    });

    it('loi 401 khi signature khong hop le', async () => {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: 'addr_test1fake',
          signature: 'invalid',
          key: 'invalid',
        }),
      });

      expect(res.status).toBe(401);
    });

    it('loi 401 khi chua lay nonce', async () => {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: 'addr_test1_new_address_no_nonce',
          signature: 'test',
          key: 'test',
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('xoa cookie thanh cong', async () => {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.message).toBe('Logged out');
    });
  });
});
