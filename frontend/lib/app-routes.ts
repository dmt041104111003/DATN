export const APP_ADMIN_SETUP = "/admin" as const;
export const APP_ENTERPRISE = "/enterprise" as const;
export const APP_TRANSIT = "/transit" as const;
export const APP_AGENT = "/agent" as const;

export function homePathForRole(role: string | null | undefined): string {
  const code = String(role || "").toUpperCase();
  if (code === "TRANSIT") return APP_TRANSIT;
  if (code === "AGENT") return APP_AGENT;
  return APP_ENTERPRISE;
}
