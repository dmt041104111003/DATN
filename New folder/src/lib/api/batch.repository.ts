import { httpClient } from "./client";
import type { 
  Batch, 
  CreateBatchInput, 
  UpdateBatchInput, 
  MintBatchInput,
  TraceBatchResult,
} from "@/types";

export const batchRepository = {
  findAll: (businessId?: string): Promise<Batch[]> => 
    httpClient.get(`/batches${businessId ? `?businessId=${businessId}` : ''}`),

  findOne: (id: string): Promise<Batch> => 
    httpClient.get(`/batches/${id}`),

  create: (data: CreateBatchInput): Promise<Batch> =>
    httpClient.post("/batches", data),

  update: (id: string, data: UpdateBatchInput): Promise<Batch> =>
    httpClient.patch(`/batches/${id}`, data),

  updateRoadmapStep: (id: string, stepOrder: number, data: { isCompleted?: boolean; confirmGps?: string; confirmTxHash?: string }): Promise<Batch> =>
    httpClient.patch(`/batches/${id}/roadmap/${stepOrder}`, data),

  remove: (id: string): Promise<void> => 
    httpClient.delete(`/batches/${id}`),

  trace: (policyId: string, assetName: string): Promise<TraceBatchResult> =>
    httpClient.get(`/batches/trace/${policyId}/${assetName}`),
};
