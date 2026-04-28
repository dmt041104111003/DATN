import { cleanString } from "./share/cleanString";
import { parseStringList } from "./share/parseStringList";
import { buildMappedMetadata } from "./share/buildMappedMetadata";
import { formatProductionRefInline } from "./share/formatProductionRefInline";

export function buildContainerMetadata(data: any, previousData: any) {
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
  return buildMappedMetadata({
    status: metadataStatus,
    container_code: data?.code || previousData?.code,
    production_ref_inline: productionRef,
    container_type: data?.containerType || previousData?.containerType,
    capacity_kg: data?.capacityKg || previousData?.capacityKg,
    actual_capacity_kg: data?.actualCapacityKg || previousData?.actualCapacityKg,
    product_name: data?.productName || previousData?.productName,
    participant_wallet_addresses: JSON.stringify(
      parseStringList(
        data?.participantWalletAddresses !== undefined
          ? data?.participantWalletAddresses
          : previousData?.participantWalletAddresses,
      ),
    ),
    participant_location_labels: parseStringList(
      data?.participantLocationLabels !== undefined
        ? data?.participantLocationLabels
        : previousData?.participantLocationLabels,
    ).join("; "),
    note: data?.note || previousData?.note,
  });
}
