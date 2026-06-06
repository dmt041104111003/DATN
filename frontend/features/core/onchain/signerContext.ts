import { cleanString } from "@/features/core/metadata/share/cleanString";
import { codesToLocationText } from "@/features/resources/shared/locationHelpers";

export type SignerContext = {
  signerWallet: string;
  signerLocationLabel: string;
  signerRole: string;
  signerDisplayName: string;
};

function buildLocationFromIds(provinceId: unknown, districtId: unknown, wardId: unknown) {
  return [cleanString(provinceId), cleanString(districtId), cleanString(wardId)].filter(Boolean).join(", ");
}

function resolveLocationFromParticipantRows(owner: string, rows: unknown[]) {
  const key = cleanString(owner).toLowerCase();
  for (const row of rows) {
    const item = row as Record<string, unknown>;
    if (cleanString(item?.walletAddress).toLowerCase() !== key) continue;
    const fromIds = buildLocationFromIds(item?.provinceId, item?.districtId, item?.wardId);
    if (fromIds) return fromIds;
    return cleanString(item?.locationLabel || item?.location);
  }
  return "";
}

export function signerContextToMetadata(ctx: SignerContext) {
  return {
    signer_wallet: ctx.signerWallet,
    signer_location_label: ctx.signerLocationLabel,
    signer_role: ctx.signerRole,
  };
}

export function signerContextToApiBody(ctx: SignerContext) {
  return {
    signerWallet: ctx.signerWallet,
    signerLocationLabel: ctx.signerLocationLabel,
    signerRole: ctx.signerRole,
    signerDisplayName: ctx.signerDisplayName,
  };
}

export async function resolveSignerContext(
  deps: {
    getSessionOwner: () => Promise<{ me: any; owner: string }>;
    httpClient: (url: string, options?: { method?: string }) => Promise<{ json: unknown }>;
    cleanString: (v: unknown) => string;
    BACKEND_URL: string;
  },
  opts: {
    warehouseId?: unknown;
    location?: unknown;
    participantRows?: unknown[];
  } = {},
): Promise<SignerContext> {
  const { me, owner } = await deps.getSessionOwner();
  const signerWallet = deps.cleanString(owner);
  const signerRole = deps.cleanString(me?.user?.roleCode || me?.user?.role).toUpperCase();
  const signerDisplayName = deps.cleanString(me?.user?.displayName || me?.profile?.displayName);

  let signerLocationLabel = deps.cleanString(opts.location);
  if (!signerLocationLabel && Array.isArray(opts.participantRows) && opts.participantRows.length) {
    signerLocationLabel = resolveLocationFromParticipantRows(signerWallet, opts.participantRows);
  }
  const warehouseId = deps.cleanString(opts.warehouseId);
  if (!signerLocationLabel && warehouseId) {
    const res = await deps.httpClient(`${deps.BACKEND_URL}/warehouse`, { method: "GET" });
    const rows = Array.isArray(res?.json) ? res.json : [];
    const warehouse = rows.find((x: any) => deps.cleanString(x?.id) === warehouseId);
    signerLocationLabel = deps.cleanString((warehouse as any)?.location);
  }

  signerLocationLabel = await codesToLocationText(signerLocationLabel);

  return { signerWallet, signerLocationLabel, signerRole, signerDisplayName };
}
