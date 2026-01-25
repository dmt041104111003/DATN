"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productRepository } from "@/lib/api/product.repository";
import type { CreateProductInput, UpdateProductInput } from "@/types";

const QUERY_KEY = "products";

export function useProducts(userId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, { userId }],
    queryFn: () => productRepository.findAll(userId),
  });
}

export function useMyProducts() {
  return useQuery({
    queryKey: [QUERY_KEY, "my"],
    queryFn: () => productRepository.findAll(),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => productRepository.findOne(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
