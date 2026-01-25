import { httpClient } from "./client";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/types";

export const agentRepository = {
  findAll: (businessId?: string): Promise<Agent[]> => 
    httpClient.get(`/agents${businessId ? `?businessId=${businessId}` : ''}`),

  findOne: (id: string): Promise<Agent> => 
    httpClient.get(`/agents/${id}`),

  findByAddress: (address: string): Promise<Agent> => 
    httpClient.get(`/agents/by-address/${address}`),

  create: (data: CreateAgentInput): Promise<Agent> =>
    httpClient.post("/agents", data),

  update: (id: string, data: UpdateAgentInput): Promise<Agent> =>
    httpClient.patch(`/agents/${id}`, data),

  remove: (id: string): Promise<void> => 
    httpClient.delete(`/agents/${id}`),
};
