
export const SAMPLE_CONTAINER_ASSET_NAME = "THUNG-20250528-DEMO01";

export function buildContainerMintMetadata(owners: string[]) {
  const wallets = JSON.stringify(owners);
  return {
    status: "CREATE",
    container_code: SAMPLE_CONTAINER_ASSET_NAME,
    production_ref_inline: "VU-202505-DEMO|Lâm Đồng|Cà chua cherry",
    container_type: "Thùng carton",
    weight_per_box_kg: "10",
    product_name: "Cà chua cherry hữu cơ",
    participant_wallet_addresses: wallets,
    verified_wallet_addresses: wallets,
    participant_location_labels: "Lâm Đồng; Bình Dương; Hà Nội",
    note: "Đóng gói tại nhà máy sau thu hoạch vụ mùa.",
  };
}

export function buildContainerUpdateMetadata(owners: string[]) {
  const wallets = JSON.stringify(owners);
  return {
    status: "UPDATE",
    container_code: SAMPLE_CONTAINER_ASSET_NAME,
    production_ref_inline: "VU-202505-DEMO|Lâm Đồng|Cà chua cherry",
    container_type: "Thùng carton",
    weight_per_box_kg: "10",
    product_name: "Cà chua cherry hữu cơ",
    participant_wallet_addresses: wallets,
    verified_wallet_addresses: wallets,
    participant_location_labels: "Lâm Đồng; Bình Dương; Hà Nội; TP. Hồ Chí Minh",
    note: "Đã nhập kho trung chuyển Bình Dương, chuẩn bị giao đại lý.",
  };
}
