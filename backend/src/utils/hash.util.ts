import * as crypto from 'crypto';

export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function hashCertification(certName: string, issueDate: Date | string, expiryDate?: Date | string | null): string {
  const issue = typeof issueDate === 'string' ? issueDate : issueDate.toISOString();
  const expiry = expiryDate ? (typeof expiryDate === 'string' ? expiryDate : expiryDate.toISOString()) : '';
  return hashString(`${certName}${issue}${expiry}`);
}

export function hashMedia(url: string, type: string): string {
  return hashString(`${url}${type}`);
}

export function hashProductMaterial(materialId: string, quantity: number, unit?: string | null): string {
  return hashString(`${materialId}${quantity}${unit || ''}`);
}

export function hashMaterial(name: string, supplierId: string, harvestDate?: Date | string | null): string {
  const harvest = harvestDate ? (typeof harvestDate === 'string' ? harvestDate : harvestDate.toISOString()) : '';
  return hashString(`${name}${supplierId}${harvest}`);
}
