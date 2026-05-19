import * as cbor from 'cbor';

export async function deserializeDatum(datum: string): Promise<Record<string, unknown>> {
  const cborDatum = Buffer.from(datum, 'hex');
  const decoded = await cbor.decodeFirst(cborDatum) as { value?: unknown[] } | unknown[];
  const datumMap = Array.isArray(decoded) ? decoded[0] : decoded?.value?.[0];
  if (!(datumMap instanceof Map)) {
    throw new Error('Datum không hợp lệ.');
  }
  const obj: Record<string, unknown> = {};
  datumMap.forEach((value: unknown, key: unknown) => {
    const keyStr = typeof key === 'object' && key && 'toString' in key
      ? (key as Buffer).toString('utf-8')
      : String(key);
    obj[keyStr] = typeof value === 'object' && value && 'toString' in value
      ? (value as Buffer).toString('utf-8')
      : value;
  });
  return obj;
}
