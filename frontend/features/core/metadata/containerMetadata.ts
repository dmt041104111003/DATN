import type { SignerContext } from "@/features/core/onchain/signerContext";
import { signerContextToMetadata } from "@/features/core/onchain/signerContext";
import { cleanString } from "./share/cleanString";
import { parseStringList } from "./share/parseStringList";
import { buildMappedMetadata } from "./share/buildMappedMetadata";
import { formatProductionRefInline } from "./share/formatProductionRefInline";

function resolveVerifiedWallets(data: any, previousData: any) {
  const raw =
    data?.participantWalletAddresses !== undefined
      ? data?.participantWalletAddresses
      : previousData?.participantWalletAddresses;
  return parseStringList(raw);
}

export function buildContainerMetadata(data: any, previousData: any, signer?: SignerContext | null) {
  const rawStatus = cleanString(data?.status || previousData?.status).toUpperCase();
  let metadataStatus = "CREATE";
  if (rawStatus === "CONSUMED") {
    metadataStatus = "CONSUMED";
  } else if (previousData) {
    metadataStatus = "UPDATE";
  } else if (rawStatus === "UPDATE") {
    metadataStatus = "UPDATE";
  }
  const productionRef = formatProductionRefInline(
    data?.productionInventoryKey || previousData?.productionInventoryKey,
  );
  const verifiedWallets = resolveVerifiedWallets(data, previousData);
  return buildMappedMetadata({
    status: metadataStatus,
    container_code: data?.code || previousData?.code,
    production_ref_inline: productionRef,
    container_type: data?.containerType || previousData?.containerType,
    weight_per_box_kg: data?.weightPerBoxKg || previousData?.weightPerBoxKg,
    product_name: data?.productName || previousData?.productName,
    participant_wallet_addresses: JSON.stringify(verifiedWallets),
    verified_wallet_addresses: JSON.stringify(verifiedWallets),
    participant_location_labels: parseStringList(
      data?.participantLocationLabels !== undefined
        ? data?.participantLocationLabels
        : previousData?.participantLocationLabels,
    ).join("; "),
    note: data?.note || previousData?.note,
    ...(signer ? signerContextToMetadata(signer) : {}),
  });
}
