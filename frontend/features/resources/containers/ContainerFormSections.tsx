"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import { ArrayInput, FormDataConsumer, SelectInput,
  SimpleFormIterator,
  TextInput,
  required,
  useSimpleFormIteratorItem,
} from "react-admin";
import { parseStringList } from "@/features/core/metadata/share/parseStringList";
import { positiveNumber } from "@/features/resources/shared/numberHelpers";
import { normalizeParticipantRow, splitLocationLabel, toLocationLabel } from "@/features/resources/shared/locationHelpers";
import { useContainerFormSections } from "@/hooks/useContainerFormSections";
import { useAdministrativeArea } from "@/hooks/useAdministrativeArea";

function ParticipantAdministrativeAreaFields({
  index,
  disabled = false,
}: {
  index: number;
  disabled?: boolean;
}) {
  const { choices, provinceId, districtId } = useAdministrativeArea(
    `participantRows.${index}.provinceId`,
    `participantRows.${index}.districtId`,
  );

  return (
    <>
      <SelectInput source="provinceId" label="Tỉnh/Thành" choices={choices.provinces} optionValue="id" optionText="name" validate={[required()]} disabled={disabled} fullWidth />
      <SelectInput source="districtId" label="Quận/Huyện" choices={choices.districts} optionValue="id" optionText="name" validate={[required()]} disabled={disabled || !provinceId} fullWidth />
      <SelectInput source="wardId" label="Phường/Xã" choices={choices.wards} optionValue="id" optionText="name" validate={[required()]} disabled={disabled || !districtId} fullWidth />
    </>
  );
}

export function parseParticipantRows(record: any) {
  const wallets = parseStringList(record?.participantWalletAddresses);
  const locations = parseStringList(record?.participantLocationLabels);
  return { ...record, participantRows: wallets.map((wallet, index) => ({ walletAddress: wallet, ...splitLocationLabel(locations[index]) })) };
}

export function buildParticipantPayload(rowsRaw: unknown) {
  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  const participantRows = rows.map(normalizeParticipantRow).filter((row: any) => row.walletAddress);
  return {
    participantWalletAddresses: participantRows.map((row: any) => row.walletAddress),
    participantLocationLabels: participantRows.map(toLocationLabel),
    participantRows,
  };
}

function ParticipantRow({ disabled = false }: { disabled?: boolean }) {
  const { index } = useSimpleFormIteratorItem();
  return (
    <>
      <TextInput source="walletAddress" label="Địa chỉ ví" validate={[required()]} disabled={disabled} fullWidth />
      <ParticipantAdministrativeAreaFields index={index} disabled={disabled} />
    </>
  );
}

export function ContainerFormSections({
  participantsReadOnly = false,
}: {
  participantsReadOnly?: boolean;
}) {
  const { storageLocked, actualCapacityValidator, capacitySummary, productionChoices } = useContainerFormSections();

  return (
    <>
      {storageLocked ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Thùng hàng đã có lịch sử nhập/xuất kho nên bị khóa cập nhật và xóa.
        </Alert>
      ) : null}
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[1] Thông tin thùng hàng</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput source="assetName" label="assetName *" disabled fullWidth />
          <SelectInput source="containerType" label="Loại thùng" choices={[{ id: "CARTON", name: "Carton" }, { id: "PALLET_BOX", name: "Pallet box" }, { id: "PLASTIC_CONTAINER", name: "Container nhựa" }]} optionValue="id" optionText="name" validate={[required()]} fullWidth />
          <TextInput source="capacityKg" label="Dung lượng chứa tối đa (kg)" type="number" validate={[required(), positiveNumber]} fullWidth />
          <TextInput source="actualCapacityKg" label="Dung lượng thực tế (kg)" type="number" validate={[required(), positiveNumber, actualCapacityValidator]} fullWidth />
          <TextInput source="productName" label="Tên sản phẩm" validate={[required()]} fullWidth />
          <SelectInput source="productionInventoryKey" label="Liên kết vụ mùa" choices={productionChoices} optionValue="id" optionText="name" validate={[required()]} fullWidth />
          <div className="md:col-span-2 text-sm text-slate-700">
            {capacitySummary
              ? `Đã tạo: ${capacitySummary.usedCapacityKg} kg | Còn lại: ${capacitySummary.remainingCapacityKg} kg`
              : "Đã tạo: 0 kg | Còn lại: 0 kg"}
          </div>
          <ArrayInput source="participantRows" label="Danh sách địa chỉ ví tham gia">
            <SimpleFormIterator disableReordering disableAdd={participantsReadOnly} disableRemove={participantsReadOnly}>
              <FormDataConsumer>
                {() => <ParticipantRow disabled={participantsReadOnly} />}
              </FormDataConsumer>
            </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="note" label="Ghi chú" multiline minRows={3} fullWidth />
        </div>
      </div>
    </>
  );
}

