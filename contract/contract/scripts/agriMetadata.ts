export type ContainerScriptMetadata = Record<string, string>;

export const SAMPLE_CONTAINER_ASSET_NAME = "THUNG_20260606_RI6_001";

export const SAMPLE_PARTICIPANT_LOCATION_LABELS =
  "Xã Ea Ktur, Huyện Cư M'gar, Tỉnh Đắk Lắk; Thành phố Thủ Dầu Một, Tỉnh Bình Dương; Thành phố Tân An, Tỉnh Long An; Quận Ninh Kiều, Thành phố Cần Thơ";

export type SampleSignerContext = {
  signerWallet?: string;
  signerLocationLabel?: string;
  signerRole?: string;
};

function signerMetadataFields(ctx: SampleSignerContext) {
  const out: Record<string, string> = {};
  const wallet = String(ctx.signerWallet || "").trim();
  const location = String(ctx.signerLocationLabel || "").trim();
  const role = String(ctx.signerRole || "").trim();
  if (wallet) out.signer_wallet = wallet;
  if (location) out.signer_location_label = location;
  if (role) out.signer_role = role;
  return out;
}

const BASE_CONTAINER_FIELDS = {
  container_code: SAMPLE_CONTAINER_ASSET_NAME,
  production_ref_inline: "policyIdHex.VU_202606_RI6",
  container_type: "Thùng xốp lạnh",
  weight_per_box_kg: "15",
  product_name: "Sầu riêng Ri6 hữu cơ",
  participant_location_labels: SAMPLE_PARTICIPANT_LOCATION_LABELS,
};

function walletFields(owners: string[]) {
  const wallets = JSON.stringify(owners);
  return {
    participant_wallet_addresses: wallets,
    verified_wallet_addresses: wallets,
  };
}

export function buildContainerMintMetadata(
  owners: string[],
  signer?: SampleSignerContext,
): ContainerScriptMetadata {
  const signerCtx: SampleSignerContext = {
    signerWallet: owners[0],
    signerLocationLabel: "Xã Ea Ktur, Huyện Cư M'gar, Tỉnh Đắk Lắk",
    signerRole: "ENTERPRISE",
    ...signer,
  };
  return {
    status: "CREATE",
    ...BASE_CONTAINER_FIELDS,
    ...walletFields(owners),
    note: "Thu hoạch vụ 2026, đóng thùng tại cơ sở Đắk Lắk. Bốn ví = DN, trung chuyển, hub, đại lý.",
    ...signerMetadataFields(signerCtx),
  };
}

export function buildContainerUpdateMetadata(
  owners: string[],
  signer?: SampleSignerContext,
): ContainerScriptMetadata {
  const signerCtx: SampleSignerContext = {
    signerWallet: owners[1] || owners[0],
    signerLocationLabel: "Thành phố Thủ Dầu Một, Tỉnh Bình Dương",
    signerRole: "TRANSIT",
    ...signer,
  };
  return {
    status: "UPDATE",
    ...BASE_CONTAINER_FIELDS,
    ...walletFields(owners),
    note: "Cập nhật hành trình: thùng rời cơ sở, chuyển sang kho trung chuyển Bình Dương.",
    ...signerMetadataFields(signerCtx),
  };
}

export function buildContainerStorageInMetadata(
  owners: string[],
  warehouseId: string,
  signer?: SampleSignerContext,
): ContainerScriptMetadata {
  const signerCtx: SampleSignerContext = {
    signerWallet: owners[1] || owners[0],
    signerLocationLabel: "Thành phố Thủ Dầu Một, Tỉnh Bình Dương",
    signerRole: "TRANSIT",
    ...signer,
  };
  const now = new Date().toISOString();
  return {
    status: "UPDATE",
    ...BASE_CONTAINER_FIELDS,
    ...walletFields(owners),
    storage_op: "IN",
    warehouse_id: warehouseId,
    storage_created_at: now,
    storage_updated_at: now,
    storage_conditions: "2-8°C",
    note: "Nhập kho trung chuyển Bình Dương, bảo quản 2–8°C.",
    ...signerMetadataFields(signerCtx),
  };
}

export function buildContainerStorageOutMetadata(
  owners: string[],
  warehouseId: string,
  options?: { consumed?: boolean; signer?: SampleSignerContext },
): ContainerScriptMetadata {
  const consumed = Boolean(options?.consumed);
  const signerCtx: SampleSignerContext = {
    signerWallet: owners[owners.length - 1] || owners[0],
    signerLocationLabel: "Quận Ninh Kiều, Thành phố Cần Thơ",
    signerRole: "AGENT",
    ...options?.signer,
  };
  const now = new Date().toISOString();
  return {
    status: consumed ? "CONSUMED" : "UPDATE",
    ...BASE_CONTAINER_FIELDS,
    ...walletFields(owners),
    storage_op: consumed ? "CONSUMED" : "OUT",
    warehouse_id: warehouseId,
    storage_updated_at: now,
    storage_conditions: "2-8°C",
    note: consumed
      ? "Đại lý Cần Thơ xác nhận tiêu thụ tại điểm bán."
      : "Xuất kho đại lý Cần Thơ, giao cho điểm phân phối.",
    ...signerMetadataFields(signerCtx),
  };
}
