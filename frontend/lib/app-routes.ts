export const APP_ENTERPRISE = "/admin" as const;

export function homePathForRole(role: string | null | undefined): string {
  return APP_ENTERPRISE;
}
