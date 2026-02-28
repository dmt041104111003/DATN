import type { UTxO } from "@meshsdk/core";
import { BadRequestException } from "@nestjs/common";

const MIN_COLLATERAL_LOVELACE = 5_000_000;

export function createReadOnlyWallet(
  changeAddress: string,
  fetcher: { fetchAddressUTxOs: (address: string) => Promise<UTxO[]> },
  walletUtxos?: UTxO[],
  utxoAddresses?: string[]
): {
  getChangeAddress: () => Promise<string>;
  getUtxos: () => Promise<UTxO[]>;
  getCollateral: () => Promise<UTxO[]>;
} {
  const dedupe = (items: UTxO[]): UTxO[] => {
    const seen = new Set<string>();
    const out: UTxO[] = [];
    for (const u of items) {
      const k = `${u.input?.txHash ?? ""}#${u.input?.outputIndex ?? ""}`;
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(u);
    }
    return out;
  };

  const getAllUtxos = async (): Promise<UTxO[]> => {
    if (walletUtxos?.length) return walletUtxos;
    if (utxoAddresses?.length) {
      const lists = await Promise.all(utxoAddresses.map((a) => fetcher.fetchAddressUTxOs(a)));
      return dedupe(lists.flat());
    }
    return fetcher.fetchAddressUTxOs(changeAddress);
  };

  return {
    getChangeAddress: () => Promise.resolve(changeAddress),
    getUtxos: () => getAllUtxos(),
    getCollateral: async () => {
      const utxos = await getAllUtxos();
      const collateral = utxos.find((u) => {
        const lovelace = u.output?.amount?.find((a) => a.unit === "lovelace")?.quantity;
        return Number(lovelace ?? 0) >= MIN_COLLATERAL_LOVELACE;
      });
      if (!collateral) {
        throw new BadRequestException(
          `No UTXO with sufficient collateral (>= ${MIN_COLLATERAL_LOVELACE} lovelace) found`
        );
      }
      return [collateral];
    },
  };
}

export function mergeDbMeta(existing: unknown, patch: Record<string, unknown>): Record<string, unknown> {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {};
  const prevDb =
    base._db && typeof base._db === "object" && !Array.isArray(base._db)
      ? (base._db as Record<string, unknown>)
      : {};
  return { ...base, _db: { ...prevDb, ...patch } };
}

export type BuildMetadataInput = {
  pk: string;
  receivers: string;
  receiver_locations: string;
  receiver_coordinates: string;
  minter_location: string;
  minter_coordinates: string;
  name: string;
  image: string;
  properties?: string;
  standard?: string;
};

export function buildMetadata(opts: BuildMetadataInput): Record<string, string> {
  let properties: Record<string, unknown> = {};
  if (opts.properties) {
    try {
      properties = JSON.parse(opts.properties) as Record<string, unknown>;
    } catch {
      properties = {};
    }
  }
  if (properties.current_holder_id === undefined) {
    properties.current_holder_id = opts.pk;
  }
  const meta: Record<string, string> = {
    name: opts.name,
    image: opts.image,
    standard: opts.standard ?? "Traceability-v1",
    properties: JSON.stringify(properties),
    _pk: opts.pk,
    receivers: opts.receivers,
    receiver_locations: opts.receiver_locations,
    receiver_coordinates: opts.receiver_coordinates,
    minter_location: opts.minter_location,
    minter_coordinates: opts.minter_coordinates,
  };
  return meta;
}
