const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

import { stringToHex } from '../utils/encoding';

const AUTH_COOKIE = 'auth_token';
function getToken(): string {
  const cookie = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
}

export type LockDeliveryItem = {
  id: number;
  lockTxHash: string;
  scriptOutputIndex: number;
  batchId: string;
  policyId: string | null;
  recipientAddress: string;
  senderAddress: string;
  ownerAddresses: string[];
  status: string;
  partialSignedTxHex?: string | null;
  partialSignedByAddress?: string | null;
  secondSignedByAddress?: string | null;
  unlockTxHash?: string | null;
};

export async function getLockDeliveries(token: string): Promise<LockDeliveryItem[]> {
  const res = await fetch(
    `${BACKEND_URL}/multisig/lock-deliveries?token=${encodeURIComponent(token)}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to load lock deliveries');
  }
  return Array.isArray(data?.deliveries) ? data.deliveries : [];
}

export async function savePartialTx(
  deliveryId: number,
  token: string,
  partialTxHex: string,
): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/multisig/lock-deliveries/${deliveryId}/save-partial-tx?token=${encodeURIComponent(token)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partialTxHex: partialTxHex.trim().replace(/^0x/, '') }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to save partial tx');
  }
}

const CIP68_LABEL_222 = '000de140';

export function normalizePkhForCompare(p: string): string {
  if (typeof p !== 'string') return '';
  const h = p.toLowerCase().trim().replace(/^0x/, '').replace(/^5820/, '').replace(/^581c/, '');
  if (h.length === 56) return h;
  if (h.length > 56) return h.slice(-56);
  return h;
}

export function pkhMatch(a: string, b: string): boolean {
  const an = normalizePkhForCompare(a);
  const bn = normalizePkhForCompare(b);
  if (an.length < 56 || bn.length < 56) return false;
  return an.slice(-56) === bn.slice(-56);
}

export function nftUnitFromPolicyAndName(
  policyId: string,
  assetName: string,
  label222: string,
): string {
  if (!policyId || !assetName) return '';
  const hexName =
    assetName.startsWith('hex:') && assetName.length > 4
      ? assetName.slice(4)
      : stringToHex(assetName);
  return policyId + (label222 || CIP68_LABEL_222) + hexName;
}

export async function getMultisigScriptAddress(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/multisig/script-address`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to get script address');
  }
  return data?.scriptAddress ?? '';
}

export async function getMultisigScriptUtxos(scriptAddress?: string): Promise<unknown[]> {
  const url = scriptAddress
    ? `${BACKEND_URL}/multisig/script-utxos?scriptAddress=${encodeURIComponent(scriptAddress)}`
    : `${BACKEND_URL}/multisig/script-utxos`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to get script UTxOs');
  }
  return Array.isArray(data?.utxos) ? data.utxos : [];
}

export async function getScriptUtxoByAsset(
  policyId: string,
  assetName: string,
  scriptAddress?: string,
): Promise<unknown | null> {
  const params = new URLSearchParams({
    policyId: policyId.trim(),
    assetName: assetName.trim(),
  });
  if (scriptAddress?.trim()) params.set('scriptAddress', scriptAddress.trim());
  const res = await fetch(`${BACKEND_URL}/multisig/script-utxo-by-asset?${params}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to find UTxO by asset');
  }
  return data?.utxo ?? null;
}

export type BuildLockTxParams = {
  scriptAddress: string;
  ownersPkh: string[];
  threshold: number;
  recipientPkh: string;
  assets: { unit: string; quantity: string }[];
  changeAddress: string;
  utxos: unknown[];
};

export async function buildLockTx(params: BuildLockTxParams): Promise<{
  unsignedTx: string;
  scriptAddress: string;
}> {
  const res = await fetch(`${BACKEND_URL}/multisig/build-lock-tx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to build lock tx');
  }
  return {
    unsignedTx: data?.unsignedTx ?? '',
    scriptAddress: data?.scriptAddress ?? params.scriptAddress,
  };
}

export type ParseDatumParams = { scriptUtxo: unknown };

export async function parseMultisigDatum(params: ParseDatumParams): Promise<{
  ownersPkh: string[];
  threshold: number;
  recipientPkh: string;
  recipientAddress: string;
  ownerAddresses: string[];
}> {
  const res = await fetch(`${BACKEND_URL}/multisig/parse-datum`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to parse datum');
  }
  return {
    ownersPkh: Array.isArray(data?.ownersPkh) ? data.ownersPkh : [],
    threshold: Number(data?.threshold) || 0,
    recipientPkh: data?.recipientPkh ?? '',
    recipientAddress: data?.recipientAddress ?? '',
    ownerAddresses: Array.isArray(data?.ownerAddresses) ? data.ownerAddresses : [],
  };
}

export type BuildUnlockTxParams = {
  scriptUtxo: unknown;
  outputAddress: string;
  signingOwnersPkh: string[];
  threshold: number;
  collateral: unknown;
  changeAddress: string;
  utxos: unknown[];
};

export async function buildUnlockTx(params: BuildUnlockTxParams): Promise<{ unsignedTx: string }> {
  const res = await fetch(`${BACKEND_URL}/multisig/build-unlock-tx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to build unlock tx');
  }
  return { unsignedTx: data?.unsignedTx ?? '' };
}

export async function mergePartialTx(partialTxHex: string, secondSignerResultHex: string): Promise<{
  mergedTxHex: string;
  witnessCount: number;
  requiredSigners: string[];
}> {
  const res = await fetch(`${BACKEND_URL}/multisig/merge-partial-tx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partialTxHex, secondSignerResultHex }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Merge partial tx failed');
  }
  return {
    mergedTxHex: data?.mergedTxHex ?? '',
    witnessCount: Number(data?.witnessCount) ?? 0,
    requiredSigners: Array.isArray(data?.requiredSigners) ? data.requiredSigners : [],
  };
}

export async function inspectTx(txHex: string): Promise<{ requiredSigners: string[]; witnessCount: number }> {
  const res = await fetch(
    `${BACKEND_URL}/multisig/inspect-tx?txHex=${encodeURIComponent(txHex.trim().replace(/^0x/, ''))}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Inspect tx failed');
  }
  return {
    requiredSigners: Array.isArray(data?.requiredSigners) ? data.requiredSigners : [],
    witnessCount: Number(data?.witnessCount) ?? 0,
  };
}
