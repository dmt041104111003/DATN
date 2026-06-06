/** Metadata mẫu thùng hàng — khớp frontend buildContainerMetadata. */

export const SAMPLE_CONTAINER_ASSET_NAME = "THUNG-20260606-RI6-001";

export function buildContainerMintMetadata(owners: string[]) {
  const wallets = JSON.stringify(owners);
  return {
    status: "CREATE",
    container_code: SAMPLE_CONTAINER_ASSET_NAME,
    production_ref_inline: "VU-202606-RI6|Đắk Lắk|Sầu riêng Ri6",
    container_type: "Thùng xốp lạnh",
    weight_per_box_kg: "15",
    product_name: "Sầu riêng Ri6 hữu cơ",
    participant_wallet_addresses: wallets,
    verified_wallet_addresses: wallets,
    participant_location_labels: "Đắk Lắk; Bình Dương; Long An; Cần Thơ",
    note: "Thu hoạch vụ 2026, đóng thùng tại nhà máy (Đắk Lắk). Bốn ví owners = DN, trung chuyển, hub, đại lý.",
  };
}

export function buildContainerUpdateMetadata(owners: string[]) {
  const wallets = JSON.stringify(owners);
  return {
    status: "UPDATE",
    container_code: SAMPLE_CONTAINER_ASSET_NAME,
    production_ref_inline: "VU-202606-RI6|Đắk Lắk|Sầu riêng Ri6",
    container_type: "Thùng xốp lạnh",
    weight_per_box_kg: "15",
    product_name: "Sầu riêng Ri6 hữu cơ",
    participant_wallet_addresses: wallets,
    verified_wallet_addresses: wallets,
    participant_location_labels: "Đắk Lắk; Bình Dương; Long An; Cần Thơ",
    note: "Đã qua hub Long An (2–8°C), chuyển giao đại lý Cần Thơ.",
  };
}
