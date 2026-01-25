import { httpClient } from "./client";
import type { Certification, CreateCertificationInput, UpdateCertificationInput } from "@/types";

export const certificationRepository = {
  findAll: (): Promise<Certification[]> => 
    httpClient.get("/certifications"),

  findOne: (id: string): Promise<Certification> =>
    httpClient.get(`/certifications/${id}`),

  create: (data: CreateCertificationInput): Promise<Certification> =>
    httpClient.post("/certifications", data),

  update: (id: string, data: UpdateCertificationInput): Promise<Certification> =>
    httpClient.patch(`/certifications/${id}`, data),

  remove: (id: string): Promise<void> => 
    httpClient.delete(`/certifications/${id}`),
};
