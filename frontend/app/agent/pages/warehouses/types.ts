export type WarehouseRow = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  maxProducts?: number | null;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
};

