export function cleanString(value: unknown) {
  return String(value ?? "").trim();
}
