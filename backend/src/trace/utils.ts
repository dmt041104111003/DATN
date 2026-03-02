export type ParsedCoordinate = { lat: number; lng: number };

export type TraceDisplay = {
  name?: string;
  standard?: string;
  image?: string;
  imageUrl?: string;
  minter_location?: string;
  receiver_locations?: string[];
  receiver_coordinates?: string;
  minter_coordinates?: string;
  properties?: Record<string, unknown>;
};

export function buildNft222Unit(policyId: string, assetName: string, prefix222: string): string {
  const hexName = Buffer.from(assetName, "utf8").toString("hex");
  return `${policyId}${prefix222}${hexName}`;
}

export function decodeHexToUtf8(value: unknown): string {
  if (value == null) return "";
  const s = String(value).trim();
  if (!s) return "";
  let hex = s;
  if (hex.startsWith("0x") || hex.startsWith("0X")) hex = hex.slice(2);
  if (!/^[0-9a-fA-F]*$/.test(hex)) return s;
  try {
    return Buffer.from(hex, "hex").toString("utf8");
  } catch {
    return s;
  }
}

export function parseOneCoordinate(coordsStr: string | undefined): ParsedCoordinate | null {
  if (!coordsStr || typeof coordsStr !== "string") return null;
  const trimmed = coordsStr.trim();
  const parts = trimmed.split(",").map((s) => s.trim());
  if (parts.length < 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function parseCoordinates(coordsStr: string | undefined): ParsedCoordinate[] {
  if (!coordsStr || typeof coordsStr !== "string") return [];
  const points: ParsedCoordinate[] = [];
  const pairs = coordsStr.split(";").map((s) => s.trim()).filter(Boolean);
  for (const pair of pairs) {
    const parts = pair.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      const lat = Number(parts[0]);
      const lng = Number(parts[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        points.push({ lat, lng });
      }
    }
  }
  return points;
}

export function buildDisplay(
  metadata: Record<string, unknown>,
  properties: Record<string, unknown>,
  minterLocation: string,
  receiverLocations: string[],
  batchImage: string | null,
): TraceDisplay {
  const rawImage = (metadata.image as string) ?? batchImage ?? "";
  let imageUrl = "";
  if (rawImage && typeof rawImage === "string") {
    const image = String(rawImage).trim();
    const pinataBase = "https://gateway.pinata.cloud/ipfs/";
    if (image.startsWith("http")) {
      imageUrl = image;
    } else if (image.length > 0) {
      const cid = image.replace(/^ipfs:\/\//, "").trim();
      if (cid) {
        imageUrl = `${pinataBase}${cid}`;
      }
    }
  }
  return {
    name: (metadata.name as string) ?? "",
    standard: (metadata.standard as string) ?? "",
    image: rawImage || undefined,
    imageUrl: imageUrl || undefined,
    minter_location: minterLocation || undefined,
    receiver_locations: receiverLocations.length > 0 ? receiverLocations : undefined,
    receiver_coordinates: (metadata.receiver_coordinates as string) ?? undefined,
    minter_coordinates: (metadata.minter_coordinates as string) ?? undefined,
    properties: properties && Object.keys(properties).length > 0 ? properties : undefined,
  };
}

