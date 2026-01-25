import { httpClient } from "./client";

export const authRepository = {
  getNonce: (a: string) => httpClient.get(`/auth/nonce?address=${a}`),
  verify: (a: string, s: string, k: string) => httpClient.post("/auth/verify", { address: a, signature: s, key: k }),
  getProfile: () => httpClient.get("/auth/profile"),
  logout: () => httpClient.post("/auth/logout"),
};
