function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error('Invalid hex string length for address.');
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16) & 0xff;
  }
  return bytes;
}

async function getMeshWallet() {
  if (typeof window === 'undefined') return null;
  try {
    const { BrowserWallet } = await import('@meshsdk/core');
    const wallet = await BrowserWallet.enable('eternl');
    return wallet;
  } catch {
    return null;
  }
}

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Polymod(values: number[]): number {
  const GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
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
  for (let i = 0; i < hrp.length; i += 1) {
    ret.push(hrp.charCodeAt(i) >>> 5);
  }
  ret.push(0);
  for (let i = 0; i < hrp.length; i += 1) {
    ret.push(hrp.charCodeAt(i) & 31);
  }
  return ret;
}

function bech32CreateChecksum(hrp: string, data: number[]): number[] {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const mod = bech32Polymod(values) ^ 1;
  const ret: number[] = [];
  for (let p = 0; p < 6; p += 1) {
    ret.push((mod >>> (5 * (5 - p))) & 31);
  }
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
      throw new Error('Invalid value in convertBits.');
    }
    acc = (acc << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (bits > 0) {
    ret.push((acc << (to - bits)) & maxv);
  }
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

async function getEternlApi(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Browser is not ready.');
  }

  const anyWindow = window as unknown as {
    cardano?: {
      eternl?: {
        enable: () => Promise<any>;
      };
    };
  };

  if (!anyWindow.cardano || !anyWindow.cardano.eternl) {
    throw new Error(
      'Eternl wallet not found. Please install and enable the extension.',
    );
  }

  const api = await anyWindow.cardano.eternl.enable();
  return api;
}

function normalizeWalletAddress(raw: string, networkId: number | null): string {
  if (!raw) throw new Error('Invalid wallet address.');
  if (raw.startsWith('addr') || raw.startsWith('stake')) return raw;
  const hrp = networkId === 1 ? 'addr' : 'addr_test';
  const bytes = hexToBytes(raw);
  return encodeBech32(hrp, bytes);
}

async function getWalletNetworkId(): Promise<number | null> {
  try {
    const wallet = await getMeshWallet();
    if (wallet && typeof (wallet as any).getNetworkId === 'function') {
      const id = await (wallet as any).getNetworkId();
      return typeof id === 'number' ? id : null;
    }
  } catch {}
  try {
    const api = await getEternlApi();
    if (typeof (api as any).getNetworkId === 'function') {
      const id = await (api as any).getNetworkId();
      return typeof id === 'number' ? id : null;
    }
  } catch {}
  return null;
}

export async function getWalletChangeAddress(): Promise<string> {
  const wallet = await getMeshWallet();
  if (wallet) {
    const raw = await wallet.getChangeAddress();
    if (raw && typeof raw === 'string') {
      const networkId = await getWalletNetworkId();
      return normalizeWalletAddress(raw, networkId);
    }
  }
  const api = await getEternlApi();
  if (typeof (api as any).getChangeAddress !== 'function') {
    throw new Error('Wallet does not support getChangeAddress.');
  }

  const raw: string = await (api as any).getChangeAddress();
  if (!raw) {
    throw new Error('Unable to get change address from wallet.');
  }

  const networkId = await getWalletNetworkId();
  return normalizeWalletAddress(raw, networkId);
}

export async function signAndSubmitWithEternl(unsignedTx: string): Promise<string> {
  const wallet = await getMeshWallet();
  if (wallet && typeof wallet.signTx === 'function' && typeof wallet.submitTx === 'function') {
    const signedTx = await (wallet as any).signTx(unsignedTx, true);
    if (signedTx && typeof signedTx === 'string') {
      const txHash = await wallet.submitTx(signedTx);
      if (txHash && typeof txHash === 'string') return txHash;
    }
  }

  const api = await getEternlApi();
  if (typeof (api as any).signTx !== 'function') {
    throw new Error('Wallet does not support signTx.');
  }

  const rawSigned = await (api as any).signTx(unsignedTx, true);
  if (!rawSigned) {
    throw new Error('Wallet failed to sign transaction.');
  }
  let signedTx: string;
  if (typeof rawSigned === 'string') {
    signedTx = rawSigned;
  } else if (Array.isArray(rawSigned)) {
    let hex = '';
    for (let i = 0; i < rawSigned.length; i++) {
      const b = rawSigned[i] & 0xff;
      hex += (b >>> 4).toString(16) + (b & 0x0f).toString(16);
    }
    signedTx = hex;
  } else if (rawSigned && typeof rawSigned === 'object') {
    const v = (rawSigned as any).signedTransaction ?? (rawSigned as any).cborTx ?? (rawSigned as any).tx ?? (rawSigned as any).cbor;
    if (typeof v !== 'string') throw new Error('Wallet returned unexpected sign format.');
    signedTx = v;
  } else {
    throw new Error('Wallet returned unexpected sign format.');
  }

  if (typeof (api as any).submitTx === 'function') {
    const txHash = await (api as any).submitTx(signedTx);
    if (txHash && typeof txHash === 'string') return txHash;
  }

  const hex = signedTx;
  const bin = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bin[i / 2] = parseInt(hex.slice(i, i + 2), 16) & 0xff;
  let binary = '';
  for (let i = 0; i < bin.length; i++) binary += String.fromCharCode(bin[i]);
  const signedTxBase64 = btoa(binary);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
  const res = await fetch(`${backendUrl}/trace/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signedTxBase64 }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Submit failed.');
  }
  if (!data?.txHash) {
    throw new Error('No txHash from submit.');
  }
  return data.txHash;
}

export async function signTxPartial(unsignedTx: string): Promise<string> {
  const wallet = await getMeshWallet();
  if (wallet && typeof (wallet as any).signTx === 'function') {
    // Mesh adapter merge witness với tx → luôn trả về full tx (đúng cho cosign)
    const rawSigned = await (wallet as any).signTx(unsignedTx, true);
    if (rawSigned && typeof rawSigned === 'string') {
      return rawSigned;
    }
  }

  const api = await getEternlApi();
  if (typeof (api as any).signTx !== 'function') {
    throw new Error('Wallet does not support signTx.');
  }

  const rawSigned = await (api as any).signTx(unsignedTx, true);
  if (!rawSigned) {
    throw new Error('Wallet failed to sign transaction.');
  }
  let signedHex: string;
  if (typeof rawSigned === 'string') {
    signedHex = rawSigned;
  } else if (Array.isArray(rawSigned)) {
    let hex = '';
    for (let i = 0; i < rawSigned.length; i++) {
      const b = rawSigned[i] & 0xff;
      hex += (b >>> 4).toString(16) + (b & 0x0f).toString(16);
    }
    signedHex = hex;
  } else if (rawSigned && typeof rawSigned === 'object') {
    const v =
      (rawSigned as any).signedTransaction ??
      (rawSigned as any).cborTx ??
      (rawSigned as any).tx ??
      (rawSigned as any).cbor;
    if (typeof v !== 'string') {
      throw new Error('Wallet returned unexpected sign format.');
    }
    signedHex = v;
  } else {
    throw new Error('Wallet returned unexpected sign format.');
  }
  // Eternl CIP-30 có thể trả về chỉ witness set; nếu ngắn hơn nhiều so với input thì merge với tx gốc
  const inputLen = unsignedTx.trim().replace(/^0x/, '').length;
  const outLen = signedHex.trim().replace(/^0x/, '').length;
  if (outLen < inputLen * 0.6 && inputLen > 500) {
    try {
      const { BrowserWallet } = await import('@meshsdk/wallet');
      const merged = (BrowserWallet as any).addBrowserWitnesses(unsignedTx, signedHex);
      if (merged && typeof merged === 'string') return merged;
    } catch {
      // fallback: trả về như cũ
    }
  }
  return signedHex;
}

/**
 * Dùng khi bạn là người ký thứ 2: nhận partial signed tx (hex), ký rồi merge witness để không mất chữ ký 1.
 * Một số ví (Eternl) khi signTx(partialTx, true) trả về full tx nhưng CHỈ có witness của mình → cần merge thủ công.
 */
export async function signTxPartialForCosign(partialTxHex: string): Promise<string> {
  const cleanPartial = partialTxHex.trim().replace(/^0x/, '');
  const partialLen = cleanPartial.length;
  if (partialLen < 100) {
    throw new Error('Partial tx hex quá ngắn.');
  }

  const result = await signTxPartial(partialTxHex);
  const cleanResult = result.trim().replace(/^0x/, '');
  const resultLen = cleanResult.length;

  if (resultLen < partialLen * 0.7) {
    return result;
  }

  try {
    const cst = await import('@meshsdk/core-cst');
    const { BrowserWallet } = await import('@meshsdk/wallet');
    const tx = cst.deserializeTx(result);
    const ws = tx.witnessSet();
    const wsHex = ws.toCbor().toString();
    if (!wsHex || wsHex.length < 10) return result;
    const merged = (BrowserWallet as any).addBrowserWitnesses(partialTxHex, wsHex);
    if (merged && typeof merged === 'string') return merged;
  } catch (_e) {
    // Nếu merge lỗi (ví đã merge đúng rồi) thì trả về result
  }
  return result;
}

export async function submitSignedTxHex(signedTxHex: string): Promise<string> {
  const wallet = await getMeshWallet();
  if (wallet && typeof (wallet as any).submitTx === 'function') {
    const txHash = await (wallet as any).submitTx(signedTxHex);
    if (txHash && typeof txHash === 'string') return txHash;
  }

  const api = await getEternlApi();
  if (typeof (api as any).submitTx === 'function') {
    const txHash = await (api as any).submitTx(signedTxHex);
    if (txHash && typeof txHash === 'string') return txHash;
  }

  const hex = signedTxHex.trim().startsWith('0x')
    ? signedTxHex.trim().slice(2)
    : signedTxHex.trim();
  const bin = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bin[i / 2] = parseInt(hex.slice(i, i + 2), 16) & 0xff;
  }
  let binary = '';
  for (let i = 0; i < bin.length; i++) binary += String.fromCharCode(bin[i]);
  const signedTxBase64 = btoa(binary);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
  const res = await fetch(`${backendUrl}/trace/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signedTxBase64 }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Submit failed.');
  }
  if (!data?.txHash) {
    throw new Error('No txHash from submit.');
  }
  return data.txHash;
}

export async function getWalletUtxoAddresses(): Promise<string[]> {
  const networkId = await getWalletNetworkId();
  const out = new Set<string>();
  out.add(normalizeWalletAddress(await getWalletChangeAddress(), networkId));

  const api = await getEternlApi();
  const used =
    typeof (api as any).getUsedAddresses === 'function'
      ? await (api as any).getUsedAddresses()
      : [];
  const unused =
    typeof (api as any).getUnusedAddresses === 'function'
      ? await (api as any).getUnusedAddresses()
      : [];

  const addAll = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const a of arr) {
      if (typeof a !== 'string') continue;
      out.add(normalizeWalletAddress(a, networkId));
    }
  };
  addAll(used);
  addAll(unused);
  return Array.from(out);
}

export async function getWalletUtxos(): Promise<unknown[]> {
  const wallet = await getMeshWallet();
  if (wallet && typeof (wallet as any).getUtxos === 'function') {
    const utxos = await (wallet as any).getUtxos();
    return Array.isArray(utxos) ? utxos : [];
  }
  const api = await getEternlApi();
  if (typeof (api as any).getUtxos === 'function') {
    const utxos = await (api as any).getUtxos();
    return Array.isArray(utxos) ? utxos : [];
  }
  throw new Error('Wallet does not support getUtxos.');
}

export async function getWalletCollateral(): Promise<unknown[]> {
  const wallet = await getMeshWallet();
  if (wallet && typeof (wallet as any).getCollateral === 'function') {
    const c = await (wallet as any).getCollateral();
    return Array.isArray(c) ? c : [];
  }
  const api = await getEternlApi();
  if (typeof (api as any).getCollateral === 'function') {
    const c = await (api as any).getCollateral();
    return Array.isArray(c) ? c : [];
  }
  throw new Error('Wallet does not support getCollateral.');
}

