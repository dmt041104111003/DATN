export function buildProductPassport(input: {
  lotReference: string;
  passport: Record<string, string>;
}): Record<string, string> {
  const lotReference = String(input.lotReference || '').trim();
  const base = input.passport && typeof input.passport === 'object' ? input.passport : {};
  const allow = new Set([
    'name',
    'description',
    'roadmap',
    'location',
    'image',
    'dispatchImage',
    'checkinImage',
    'consumeImage',
    'owners',
    'productName',
    'containerType',
    'status',
    // Capacity as JSON string (like Plan.quantities)
    'capacities',
    // Growing area snapshot as JSON string (like Plan.growing_area)
    'growing_area',
    // Plan reference as JSON string (like Plan.growing_area)
    'plan_ref',
    'meta_version',
    'metaVersion',
  ]);

  const out: Record<string, string> = {};
  for (const [k0, v0] of Object.entries(base)) {
    const k = String(k0 || '').trim();
    if (!k) continue;
    if (!allow.has(k)) continue;
    const v = String(v0 ?? '').trim();
    if (!v) continue;
    out[k] = v;
  }

  // NOTE: Product stores Plan reference only via plan_ref JSON (no plan_code/plan_unit keys).

  out.productName = lotReference;
  return out;
}

