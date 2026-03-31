
export function stringToHex(str: string): string {
  return Array.from(str)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

const CIP68_LABEL_100 = "000643b0";

export function ref100Unit(policyId: string, productName: string): string {
  const pid = (policyId || "").trim();
  const name = (productName || "").trim();
  if (!pid || !name) return "";
  return pid + CIP68_LABEL_100 + stringToHex(name);
}
