import { cleanString } from "@/features/core/metadata/share/cleanString";
import { parseStringList } from "@/features/core/metadata/share/parseStringList";

export function buildOwnerList(input: unknown, fallbackOwner?: unknown) {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const source = input as any;
    const fromRows = Array.isArray(source?.participantRows)
      ? source.participantRows.map((row: any) => cleanString(row?.walletAddress)).filter(Boolean)
      : [];
    const fromField = parseStringList(source?.participantWalletAddresses).map((x) => cleanString(x));
    const participants = Array.from(new Set([...fromRows, ...fromField].filter(Boolean)));
    if (participants.length) return participants;
    const fallback = cleanString(fallbackOwner);
    return fallback ? [fallback] : [];
  }
  const rows = Array.isArray(input) ? input : [input];
  const values = rows.map((owner) => cleanString(owner)).filter(Boolean);
  return Array.from(new Set(values));
}
