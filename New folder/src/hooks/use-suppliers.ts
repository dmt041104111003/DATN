"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierRepository } from "@/lib/api/supplier.repository";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/types";

const QUERY_KEY = "suppliers";

export function useSuppliers() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: supplierRepository.findAll,
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => supplierRepository.findOne(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierInput) => supplierRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierInput }) =>
      supplierRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
