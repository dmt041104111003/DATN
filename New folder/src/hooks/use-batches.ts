"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { batchRepository } from "@/lib/api/batch.repository";
import type { CreateBatchInput, UpdateBatchInput, MintBatchInput } from "@/types";

const QUERY_KEY = "batches";

export function useBatches(businessId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, { businessId }],
    queryFn: () => batchRepository.findAll(businessId),
  });
}

export function useBatch(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => batchRepository.findOne(id),
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBatchInput) => batchRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBatchInput }) =>
      batchRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateBatchRoadmapStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stepOrder, data }: { id: string; stepOrder: number; data: { isCompleted?: boolean; confirmGps?: string; confirmTxHash?: string } }) =>
      batchRepository.updateRoadmapStep(id, stepOrder, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => batchRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
