function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hex string length.");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16) & 0xff;
  }
  return bytes;
}

const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function bech32Polymod(values: number[]): number {
  const GENERATORS = [
    0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3,
  ];
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i += 1) {
      if ((top >>> i) & 1) chk ^= GENERATORS[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i += 1) ret.push(hrp.charCodeAt(i) >>> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; i += 1) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}

function bech32CreateChecksum(hrp: string, data: number[]): number[] {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const mod = bech32Polymod(values) ^ 1;
  const ret: number[] = [];
  for (let p = 0; p < 6; p += 1) ret.push((mod >>> (5 * (5 - p))) & 31);
  return ret;
}

function convertBits(data: Uint8Array, from: number, to: number): number[] {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << to) - 1;
  for (let i = 0; i < data.length; i += 1) {
    const value = data[i];
    if (value < 0 || value >> from !== 0) {
      throw new Error("Invalid value in convertBits.");
    }
    acc = (acc << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (bits > 0) ret.push((acc << (to - bits)) & maxv);
  return ret;
}

function encodeBech32(hrp: string, data: Uint8Array): string {
  const fiveBitData = convertBits(data, 8, 5);
  const checksum = bech32CreateChecksum(hrp, fiveBitData);
  const combined = fiveBitData.concat(checksum);
  let out = `${hrp}1`;
  combined.forEach((v) => {
    out += BECH32_CHARSET[v];
  });
  return out;
}

async function getMeshWallet(): Promise<any | null> {
  if (typeof window === "undefined") return null;
  try {
    const { BrowserWallet } = await import("@meshsdk/core");
    const wallet = await BrowserWallet.enable("eternl");
    return wallet;
  } catch {
    return null;
  }
}

async function getEternlApi(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Browser is not ready.");
  }

  const anyWindow = window as unknown as {
    cardano?: {
      eternl?: { enable: () => Promise<any> };
    };
  };

  if (!anyWindow.cardano || !anyWindow.cardano.eternl) {
    throw new Error("Eternl wallet not found. Please install and enable it.");
  }
  return await anyWindow.cardano.eternl.enable();
}

async function getWalletNetworkId(): Promise<number | null> {
  try {
    const wallet = await getMeshWallet();
    if (wallet && typeof (wallet as any).getNetworkId === "function") {
      const id = await (wallet as any).getNetworkId();
      return typeof id === "number" ? id : null;
    }
  } catch {}
  try {
    const api = await getEternlApi();
    if (typeof (api as any).getNetworkId === "function") {
      const id = await (api as any).getNetworkId();
      return typeof id === "number" ? id : null;
    }
  } catch {}
  return null;
}

function normalizeWalletAddress(raw: string, networkId: number | null): string {
  if (!raw) throw new Error("Invalid wallet address.");
  if (raw.startsWith("addr") || raw.startsWith("stake")) return raw;
  const hrp = networkId === 1 ? "addr" : "addr_test";
  return encodeBech32(hrp, hexToBytes(raw));
}

export async function getWalletChangeAddress(): Promise<string> {
  const wallet = await getMeshWallet();
  if (wallet && typeof (wallet as any).getChangeAddress === "function") {
    const raw = await wallet.getChangeAddress();
    if (raw && typeof raw === "string") {
      const networkId = await getWalletNetworkId();
      return normalizeWalletAddress(raw, networkId);
    }
  }

  const api = await getEternlApi();
  if (typeof (api as any).getChangeAddress !== "function") {
    throw new Error("Wallet does not support getChangeAddress.");
  }
  const raw: string = await (api as any).getChangeAddress();
  const networkId = await getWalletNetworkId();
  return normalizeWalletAddress(raw, networkId);
}

function extractSignedTxHex(rawSigned: unknown): string {
  if (!rawSigned) throw new Error("Wallet failed to sign transaction.");
  if (typeof rawSigned === "string") return rawSigned;
  if (Array.isArray(rawSigned)) {
    let hex = "";
    for (let i = 0; i < rawSigned.length; i += 1) {
      const b = rawSigned[i] & 0xff;
      hex += (b >>> 4).toString(16) + (b & 0x0f).toString(16);
    }
    return hex;
  }
  if (rawSigned && typeof rawSigned === "object") {
    const v =
      (rawSigned as any).signedTransaction ??
      (rawSigned as any).cborTx ??
      (rawSigned as any).tx ??
      (rawSigned as any).cbor;
    if (typeof v !== "string") {
      throw new Error("Wallet returned unexpected sign format.");
    }
    return v;
  }
  throw new Error("Wallet returned unexpected sign format.");
}

async function isLikelyFullTxHex(hex: string): Promise<boolean> {
  const clean = hex.trim().replace(/^0x/, "");
  if (clean.length < 200) return false;
  const firstByte = parseInt(clean.slice(0, 2), 16);
  const isArray =
    (firstByte >= 0x80 && firstByte <= 0x9b) || firstByte === 0x9f;
  if (!isArray) return false;
  try {
    const cst = await import("@meshsdk/core-cst");
    (cst as any).deserializeTx(clean);
    return true;
  } catch {
    return false;
  }
}

export async function signTxWithEternl(
  unsignedTx: string,
  opts?: { partialSign?: boolean },
): Promise<string> {
  const partialSign = opts?.partialSign ?? false;
  const unsignedClean = unsignedTx.trim().replace(/^0x/, "");
  const wallet = await getMeshWallet();
  if (wallet && typeof (wallet as any).signTx === "function") {
    const rawSigned = await (wallet as any).signTx(unsignedClean, partialSign);
    const signedHex = extractSignedTxHex(rawSigned).trim().replace(/^0x/, "");
    if (signedHex) {
      if (await isLikelyFullTxHex(signedHex)) return signedHex;
      // Fallthrough to witness-merge path below.
    }
  }

  const api = await getEternlApi();
  if (typeof (api as any).signTx !== "function") {
    throw new Error("Wallet does not support signTx.");
  }
  const rawSigned = await (api as any).signTx(unsignedClean, partialSign);
  const signedHex = extractSignedTxHex(rawSigned).trim().replace(/^0x/, "");

  if (await isLikelyFullTxHex(signedHex)) return signedHex;

  try {
    const { BrowserWallet } = await import("@meshsdk/wallet");
    const merged = (BrowserWallet as any).addBrowserWitnesses(
      unsignedClean,
      signedHex,
    );
    if (merged && typeof merged === "string") {
      const mergedHex = merged.trim().replace(/^0x/, "");
      if (await isLikelyFullTxHex(mergedHex)) return mergedHex;
      throw new Error("Merged signed tx is not a valid Shelley Tx.");
    }
    throw new Error("Failed to merge witnesses into unsigned tx.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Wallet returned witnesses/invalid tx. Merge failed: ${msg}`,
    );
  }
}

export async function submitSignedTxHex(signedTxHex: string): Promise<string> {
  const clean = signedTxHex.trim().replace(/^0x/, "");
  if (!clean) {
    throw new Error("No signed transaction hex provided.");
  }

  const wallet = await getMeshWallet();
  if (wallet && typeof (wallet as any).submitTx === "function") {
    const txHash = await (wallet as any).submitTx(clean);
    if (txHash && typeof txHash === "string") {
      return txHash;
    }
  }

  const api = await getEternlApi();
  if (typeof (api as any).submitTx === "function") {
    const txHash = await (api as any).submitTx(clean);
    if (txHash && typeof txHash === "string") {
      return txHash;
    }
  }

  throw new Error("Wallet does not support submitTx. Cannot submit transaction.");
}

