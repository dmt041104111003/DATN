import { httpClient } from "./client";
import type { Material, CreateMaterialInput, UpdateMaterialInput } from "@/types";

export const materialRepository = {
  findAll: (supplierId?: string): Promise<Material[]> => 
    httpClient.get(`/materials${supplierId ? `?supplierId=${supplierId}` : ''}`),

  findOne: (id: string): Promise<Material> => 
    httpClient.get(`/materials/${id}`),

  create: (data: CreateMaterialInput): Promise<Material> =>
    httpClient.post("/materials", data),

  update: (id: string, data: UpdateMaterialInput): Promise<Material> =>
    httpClient.patch(`/materials/${id}`, data),

  remove: (id: string): Promise<void> => 
    httpClient.delete(`/materials/${id}`),
};
