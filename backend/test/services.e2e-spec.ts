import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

const API_URL = 'http://localhost:3000';

describe('Services (e2e)', () => {
  describe('GET /services', () => {
    it('tra ve danh sach goi dich vu (public)', async () => {
      const res = await fetch(`${API_URL}/services`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('co 3 goi dich vu sau khi seed', async () => {
      const res = await fetch(`${API_URL}/services`);
      const data = await res.json();

      expect(data.length).toBeGreaterThanOrEqual(3);
      
      const names = data.map((s: any) => s.name);
      expect(names).toContain('Starter');
      expect(names).toContain('Company');
      expect(names).toContain('Enterprise');
    });
  });

  describe('GET /services/:id', () => {
    it('tra ve chi tiet goi dich vu', async () => {
      const res = await fetch(`${API_URL}/services/starter`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe('starter');
      expect(data.name).toBe('Starter');
      expect(data.price).toBe(29);
    });

    it('loi 404 khi khong tim thay', async () => {
      const res = await fetch(`${API_URL}/services/not-exist`);
      expect(res.status).toBe(404);
    });
  });
});
