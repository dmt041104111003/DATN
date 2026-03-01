export function randomAssetName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 5; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `trace${suffix}`;
}

