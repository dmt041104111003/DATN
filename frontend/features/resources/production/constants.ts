export type ProductionStatus = "CREATED" | "UPDATED" | "CLOSED";
import type { Option } from "@/features/resources/shared/location";
export type { Option } from "@/features/resources/shared/location";

export const CERTIFICATIONS: Option[] = [
  { id: "vietgap", name: "VietGAP" },
  { id: "globalgap", name: "GlobalGAP" },
  { id: "organic", name: "Hữu cơ" },
  { id: "ocop", name: "OCOP" },
  { id: "other", name: "Khác" },
];
