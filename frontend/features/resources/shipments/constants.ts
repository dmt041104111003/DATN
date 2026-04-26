"use client";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export const SHIPMENT_STATUS_CHOICES = [
  { id: "CREATED", name: "Mới tạo" },
  { id: "IN_TRANSIT", name: "Đang vận chuyển" },
  { id: "DELIVERED", name: "Đã giao" },
];
