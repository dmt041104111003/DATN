"use server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export const getProductTrace = async ({ unit }: { unit: string }) => {
  const encoded = encodeURIComponent(unit);
  const res = await fetch(`${BACKEND_URL}/trace/${encoded}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product trace from backend");
  }

  return res.json();
};
