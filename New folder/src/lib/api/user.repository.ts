import { httpClient } from "./client"
import type { User, UserRole } from "@/types"

export interface AgentUserInfo {
  id: string
  address: string
  name: string | null
  role: UserRole | null
}

export const userRepository = {
  getMe: (): Promise<User> => httpClient.get("/users/me"),
  
  updateMe: (data: { name?: string; role?: UserRole; registryTxHash?: string }): Promise<User> => 
    httpClient.patch("/users/me", data),

  findByAddress: (address: string): Promise<AgentUserInfo | null> =>
    httpClient.get(`/users/by-address/${address}`),
}
