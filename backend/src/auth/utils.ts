import { bech32 } from "bech32";

export type StakeAddressInput = string | { address?: string } | undefined;

export function normalizeAddress(raw: StakeAddressInput): string | undefined {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw.address === "string") {
    return raw.address;
  }
  return undefined;
}

export function isPaymentAddress(addr: string): boolean {
  const s = (addr || "").trim();
  return s.startsWith("addr_test1") || s.startsWith("addr1");
}

export function hexToBech32Address(
  hex: string,
  network: "mainnet" | "preprod"
): string | null {
  const raw = (hex || "").trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(raw)) return null;
  const len = raw.length;
  let bytes: Buffer;
  if (len === 56) {
    const pkh = Buffer.from(raw, "hex");
    const header = network === "mainnet" ? 0x21 : 0x20;
    bytes = Buffer.concat([Buffer.from([header]), pkh]);
  } else if (len === 58 || len === 114) {
    bytes = Buffer.from(raw, "hex");
  } else {
    return null;
  }
  try {
    const words = bech32.toWords(bytes as unknown as Uint8Array);
    const hrp = network === "mainnet" ? "addr" : "addr_test";
    return bech32.encode(hrp, words, 1000);
  } catch {
    return null;
  }
}

export function normalizeStakeAddress(
  stakeAddress: string,
  network: "mainnet" | "preprod"
): string {
  let addr = (stakeAddress || "").trim();
  if (!isPaymentAddress(addr)) {
    const fromHex = hexToBech32Address(addr, network);
    if (fromHex) addr = fromHex;
  }
  return addr;
}

