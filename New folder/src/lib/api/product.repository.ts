import { httpClient } from "./client";
import type { Product, CreateProductInput, UpdateProductInput, TraceResult } from "@/types";

export const productRepository = {
  findAll: (userId?: string): Promise<Product[]> => 
    httpClient.get(`/products${userId ? `?userId=${userId}` : ''}`),

  findOne: (id: string): Promise<Product> => 
    httpClient.get(`/products/${id}`),

  create: (data: CreateProductInput): Promise<Product> =>
    httpClient.post("/products", data),

  update: (id: string, data: UpdateProductInput): Promise<Product> =>
    httpClient.patch(`/products/${id}`, data),

  remove: (id: string): Promise<void> => 
    httpClient.delete(`/products/${id}`),
};
