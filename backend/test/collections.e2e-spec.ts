import { setupAuthenticatedContext, TestContext, API_URL } from './helpers/auth.helper';

describe('Collections (e2e)', () => {
  let ctx: TestContext | null;
  let createdCollectionId: string;

  beforeAll(async () => {
    ctx = await setupAuthenticatedContext();
  });

  describe('GET /collections (public)', () => {
    it('tra ve danh sach collections', async () => {
      const res = await fetch(`${API_URL}/collections`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /collections (protected)', () => {
    it('loi 401 khi chua login', async () => {
      const res = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Collection' }),
      });

      expect(res.status).toBe(401);
    });

    it('tao collection thanh cong', async () => {
      if (!ctx?.cookie) return;

      const res = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Test Collection E2E',
          description: 'Created by E2E test',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.name).toBe('Test Collection E2E');

      createdCollectionId = data.id;
    });
  });

  describe('PATCH /collections/:id', () => {
    it('cap nhat collection thanh cong', async () => {
      if (!ctx?.cookie || !createdCollectionId) return;

      const res = await fetch(`${API_URL}/collections/${createdCollectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': ctx.cookie,
        },
        body: JSON.stringify({
          name: 'Updated Collection E2E',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Collection E2E');
    });
  });

  describe('DELETE /collections/:id', () => {
    it('xoa collection thanh cong', async () => {
      if (!ctx?.cookie || !createdCollectionId) return;

      const res = await fetch(`${API_URL}/collections/${createdCollectionId}`, {
        method: 'DELETE',
        headers: { 'Cookie': ctx.cookie },
      });

      expect(res.status).toBe(200);
    });
  });
});
