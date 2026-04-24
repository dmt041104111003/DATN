export const APP_AGENT = "/agent" as const;
export const APP_ENTERPRISE = "/enterprise/admin" as const;
export const APP_TRANSIT = "/transit" as const;

export function homePathForRole(role: string | null | undefined): string {
  if (role === "ENTERPRISE") return APP_ENTERPRISE;
  if (role === "TRANSIT") return APP_TRANSIT;
  return APP_AGENT;
}
