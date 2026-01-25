"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shipmentRepository } from "@/lib/api/shipment.repository";
import { contractRepository } from "@/lib/api/contract.repository";
import type { CreateShipmentInput } from "@/types";

const QUERY_KEY = "shipments";

export function useShipments(batchId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, { batchId }],
    queryFn: () => shipmentRepository.findAll(batchId),
  });
}

export function useShipmentsByBatch(batchId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "batch", batchId],
    queryFn: () => shipmentRepository.findAll(batchId),
    enabled: !!batchId,
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => shipmentRepository.findOne(id),
    enabled: !!id,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShipmentInput) => shipmentRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; confirmTxHash?: string; cancelTxHash?: string } }) =>
      shipmentRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function usePendingShipments() {
  return useQuery({
    queryKey: [QUERY_KEY, "pending"],
    queryFn: () => shipmentRepository.findAll().then(shipments => 
      shipments.filter((s: any) => s.status === 'PENDING')
    ),
  });
}

export function useConfirmShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      walletAddress: string;
      shipmentAddress: string;
      shipmentUtxoHash: string;
      shipmentUtxoIndex: number;
      policyId: string;
      assetName: string;
      quantity: string;
    }) => contractRepository.confirmShipment(params.walletAddress, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useCancelShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      walletAddress: string;
      shipmentAddress: string;
      shipmentUtxoHash: string;
      shipmentUtxoIndex: number;
      policyId: string;
      assetName: string;
    }) => contractRepository.cancelShipment(params.walletAddress, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}
