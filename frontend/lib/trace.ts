import type { TraceData } from '@/types/trace';
import { encodeTraceId } from '@/utils/utils';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export async function fetchTrace(
  policyId: string,
  assetName: string
): Promise<TraceData> {
  const url = `${BACKEND_URL}/trace?policyId=${encodeURIComponent(policyId)}&assetName=${encodeURIComponent(assetName)}`;
  const res = await fetch(url);
  const body = await res.json();
  if (body.statusCode && body.statusCode >= 400) {
    throw new Error(body.message ?? 'Trace failed.');
  }
  return body as TraceData;
}

export async function submitTraceForm(
  policyId: string,
  assetName: string
): Promise<string> {
  const p = policyId.trim();
  const a = assetName.trim();
  const res = await fetch(`${BACKEND_URL}/trace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ policyId: p, assetName: a }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message ?? 'Trace failed.');
  }
  return encodeTraceId(p, a);
}
