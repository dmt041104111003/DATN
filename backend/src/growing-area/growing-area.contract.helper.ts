export function buildGrowingAreaPassport(input: {
  assetName: string;
  name: string;
  location: string;
  areaSize?: string | null;
  soilType?: string | null;
  owners: string[];
  nftImageIpfs?: string | null;
}): Record<string, string> {
  const assetName = (input.assetName || '').trim();
  const name = (input.name || '').trim();
  const location = (input.location || '').trim();
  const owners = Array.isArray(input.owners)
    ? input.owners.map((s) => String(s || '').trim()).filter(Boolean)
    : [];

  return {
    assetName,
    name,
    location,
    owners: `[${owners.join(', ')}]`,
    areaSize: (input.areaSize || '').trim(),
    soilType: (input.soilType || '').trim(),
    image: String(input.nftImageIpfs || '').trim(),
  };
}

