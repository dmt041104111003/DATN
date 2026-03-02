import type { TraceData } from '@/types/trace';

export function decodeTraceId(id: string): { policyId: string; assetName: string } | null {
  try {
    const decoded = decodeURIComponent(id);
    const json =
      typeof atob !== 'undefined'
        ? atob(decoded)
        : Buffer.from(decoded, 'base64').toString('utf8');
    return JSON.parse(json) as { policyId: string; assetName: string };
  } catch {
    return null;
  }
}

export function encodeTraceId(policyId: string, assetName: string): string {
  const payload = JSON.stringify({ policyId, assetName });
  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(payload, 'utf8').toString('base64')
      : btoa(unescape(encodeURIComponent(payload)));
  return encodeURIComponent(base64);
}

export function formatPropertyValue(val: unknown): string {
  if (val == null) return '';
  const s = String(val);
  if (s.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const date = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const time = d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${date}, ${time}`;
    }
  }
  return s;
}

export function mapDataToRouteCoords(mapData: TraceData['mapData']): string {
  if (!mapData?.length) return '';
  let lastIndex = mapData.length - 1;
  for (let i = 1; i < mapData.length; i += 1) {
    if (mapData[i]?.status !== 'completed') {
      lastIndex = i - 1;
      break;
    }
  }
  const used = mapData.slice(0, lastIndex + 1);
  return used.map((p) => `${p.lat},${p.lng}`).join(';');
}

const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io';

export function getProductImageUrl(display: TraceData['display']): string | null {
  if (!display) return null;
  if (display.imageUrl) return display.imageUrl;
  const raw = display.image;
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim();
  if (s.startsWith('http')) return s;
  const cid = s.startsWith('ipfs://') ? s.replace(/^ipfs:\/\//, '').trim() : s;
  if (!cid) return null;
  const base =
    (
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_IPFS_GATEWAY) ||
      DEFAULT_IPFS_GATEWAY
    ).trim() || '';
  if (!base) return null;
  const baseClean = base.replace(/\/+$/, '');
  if (baseClean.toLowerCase().endsWith('/ipfs')) {
    return `${baseClean}/${cid}`;
  }
  return `${baseClean}/ipfs/${cid}`;
}

const ADDITIONAL_PROPERTY_LABEL_MAP: Record<string, string> = {
  ngayhethan: 'Expiry date',
  'ngay het han': 'Expiry date',
  ngay_het_han: 'Expiry date',
};

export function getAdditionalPropertyDisplayLabel(key: string): string {
  const normalizedKey = key.replace(/_/g, ' ').toLowerCase();
  const isCurrentHolderId =
    normalizedKey === 'current holder id' ||
    /current\s*holder\s*id/.test(normalizedKey);
  if (isCurrentHolderId) return 'Product batch creator';
  return ADDITIONAL_PROPERTY_LABEL_MAP[normalizedKey] ?? ADDITIONAL_PROPERTY_LABEL_MAP[key] ?? key.replace(/_/g, ' ');
}
