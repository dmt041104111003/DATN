import { httpClient } from "./client";
import type { Supplier, CreateSupplierInput, UpdateSupplierInput } from "@/types";

export const supplierRepository = {
  findAll: (): Promise<Supplier[]> => httpClient.get("/suppliers"),

  findOne: (id: string): Promise<Supplier> => httpClient.get(`/suppliers/${id}`),

  create: (data: CreateSupplierInput): Promise<Supplier> =>
    httpClient.post("/suppliers", data),

  update: (id: string, data: UpdateSupplierInput): Promise<Supplier> =>
    httpClient.patch(`/suppliers/${id}`, data),

  remove: (id: string): Promise<void> => httpClient.delete(`/suppliers/${id}`),
};
