"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentRepository } from "@/lib/api/agent.repository";
import type { CreateAgentInput, UpdateAgentInput } from "@/types";

const QUERY_KEY = "agents";

export function useAgents(businessId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, { businessId }],
    queryFn: () => agentRepository.findAll(businessId),
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => agentRepository.findOne(id),
    enabled: !!id,
  });
}

export function useAgentByAddress(address: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "address", address],
    queryFn: () => agentRepository.findByAddress(address),
    enabled: !!address,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentInput) => agentRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentInput }) =>
      agentRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}


export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
