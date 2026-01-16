import { API_URL } from './helpers/auth.helper';

describe('AppController (e2e)', () => {
  it('/ (GET) chua login tra ve 401', async () => {
    const res = await fetch(`${API_URL}/`);
    expect(res.status).toBe(401);
  });
});
