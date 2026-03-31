export function buildPlanPassport(input: {
  growingAreaSnapshot: unknown;
  cropType: string;
  seedCertificateIpfs?: string | null;
  seedInvoiceIpfs?: string | null;
  harvestImageIpfs?: string | null;
  packagingImageIpfs?: string | null;

  createJson?: Record<string, unknown>;
  harvestJson?: Record<string, unknown>;
  packagingJson?: Record<string, unknown>;

  plannedTimeline?: Record<string, unknown>;
  quantities?: Record<string, unknown>;
}): Record<string, string> {
  const cropType = String(input.cropType || '').trim();
  const snapshot = input.growingAreaSnapshot ?? null;
  const seedCertificate = String(input.seedCertificateIpfs || '').trim();
  const seedInvoice = String(input.seedInvoiceIpfs || '').trim();
  const harvestImage = String(input.harvestImageIpfs || '').trim();
  const packagingImage = String(input.packagingImageIpfs || '').trim();
  const createJson = input.createJson ?? {};
  const harvestJson = input.harvestJson ?? {};
  const packagingJson = input.packagingJson ?? {};

  const plannedTimeline = input.plannedTimeline ?? {};
  const quantities = input.quantities ?? {};

  const out: Record<string, string> = {
    growing_area: JSON.stringify(snapshot),
    crop_type: cropType,
    certificate: seedCertificate,
    invoice: seedInvoice,
    // Backward-compatible keys (older records)
    seed_certificate: seedCertificate,
    seed_invoice: seedInvoice,
    // Use certificate as the NFT image (no separate image field).
    image: seedCertificate,
    // 3 stage-scoped JSON blocks
    create_json: JSON.stringify(createJson),
    harvest_json: JSON.stringify(harvestJson),
    packaging_json: JSON.stringify(packagingJson),

    // Legacy merged buckets (keep for compatibility)
    planned_timeline: JSON.stringify(plannedTimeline),
    quantities: JSON.stringify(quantities),
  };

  if (harvestImage) {
    out.harvest_image = harvestImage;
    // Optional backward-compatible key
    out.harvest_image_ipfs = harvestImage;
  }

  if (packagingImage) {
    out.packaging_image = packagingImage;
    // Optional backward-compatible key
    out.packaging_image_ipfs = packagingImage;
  }

  return out;
}

