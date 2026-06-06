import { deserializeDatum } from "@meshsdk/core";

export function convertDatum(plutusData: string): Record<string, string> {
  const datum = deserializeDatum(plutusData);
  const metadata: Record<string, string> = {};
  try {
    const list = datum?.fields?.[0]?.list || datum?.fields?.[0];

    if (!Array.isArray(list)) {
      console.warn("Invalid CIP68 format: list not found");
      return metadata;
    }

    list.forEach((item: { fields?: { bytes?: string }[] }) => {
      const fields = item?.fields || item;

      if (!Array.isArray(fields) || fields.length < 2) return;

      const keyHex = fields[0]?.bytes;
      const valueHex = fields[1]?.bytes;

      if (!keyHex || !valueHex) return;

      const key = Buffer.from(keyHex, "hex").toString("utf8");
      const value = Buffer.from(valueHex, "hex").toString("utf8");

      metadata[key] = value;
    });

    return metadata;
  } catch (error) {
    console.error("Error converting CIP68 to metadata:", error);
    return {};
  }
}
