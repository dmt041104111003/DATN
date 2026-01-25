"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificationRepository } from "@/lib/api/certification.repository";
import type { CreateCertificationInput, UpdateCertificationInput } from "@/types";

const QUERY_KEY = "certifications";

export function useCertifications() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: certificationRepository.findAll,
  });
}


export function useCertification(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => certificationRepository.findOne(id),
    enabled: !!id,
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCertificationInput) => certificationRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCertificationInput }) =>
      certificationRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => certificationRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
