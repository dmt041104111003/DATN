"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialRepository } from "@/lib/api/material.repository";
import type { CreateMaterialInput, UpdateMaterialInput } from "@/types";

const QUERY_KEY = "materials";

export function useMaterials(supplierId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, { supplierId }],
    queryFn: () => materialRepository.findAll(supplierId),
  });
}

export function useMaterialsBySupplier(supplierId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "supplier", supplierId],
    queryFn: () => materialRepository.findAll(supplierId),
    enabled: !!supplierId,
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => materialRepository.findOne(id),
    enabled: !!id,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaterialInput) => materialRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialInput }) =>
      materialRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => materialRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
