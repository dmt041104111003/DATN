export function parseCoords(input: string): [number, number][] {
  return input
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [latStr, lngStr] = chunk.split(',').map((s) => s.trim());
      const lat = Number(latStr);
      const lng = Number(lngStr);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return [lat, lng] as [number, number];
    })
    .filter((x): x is [number, number] => x != null);
}

export function parseLocations(input: string): string[] {
  return input
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}
