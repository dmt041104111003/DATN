import { httpClient } from "./client";
import type { 
  Shipment, 
  CreateShipmentInput, 
  ConfirmShipmentInput,
  CancelShipmentInput,
} from "@/types";

export const shipmentRepository = {
  findAll: (batchId?: string): Promise<Shipment[]> => 
    httpClient.get(`/shipments${batchId ? `?batchId=${batchId}` : ''}`),

  findOne: (id: string): Promise<Shipment> => 
    httpClient.get(`/shipments/${id}`),

  create: (data: CreateShipmentInput): Promise<Shipment> =>
    httpClient.post("/shipments", data),

  update: (id: string, data: { status?: string; confirmTxHash?: string; cancelTxHash?: string }): Promise<Shipment> =>
    httpClient.patch(`/shipments/${id}`, data),
};
