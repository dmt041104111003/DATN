"use client";

import {
  ArrayInput,
  FormDataConsumer,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  required,
  useSimpleFormIteratorItem,
} from "react-admin";
import { MilGrid, MilSection } from "@/features/ui/military/MilSection";
import { parseStringList } from "@/features/core/metadata/share/parseStringList";
import { positiveIntegerMax100, positiveNumber } from "@/features/resources/shared/numberHelpers";
import {
  EMPTY_PARTICIPANT_ROW,
  normalizeParticipantRow,
  splitLocationLabel,
  toLocationLabel,
} from "@/features/resources/shared/locationHelpers";
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
  return {
    ...record,
    participantRows: wallets.length
      ? wallets.map((wallet, index) => ({
          walletAddress: wallet,
          ...splitLocationLabel(locations[index]),
        }))
      : [{ ...EMPTY_PARTICIPANT_ROW }],
  };
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

function ParticipantRow({
  disabled = false,
  creatorRowLocked = false,
}: {
  disabled?: boolean;
  creatorRowLocked?: boolean;
}) {
  const { index } = useSimpleFormIteratorItem();
  const rowDisabled = disabled || (creatorRowLocked && index === 0);
  return (
    <>
      <TextInput source="walletAddress" label="Địa chỉ ví" validate={[required()]} disabled={rowDisabled} fullWidth />
      <ParticipantAdministrativeAreaFields index={index} disabled={rowDisabled} />
    </>
  );
}

export function ContainerFormSections({
  participantsReadOnly = true,
  showBoxQuantity = false,
}: {
  participantsReadOnly?: boolean;
  showBoxQuantity?: boolean;
}) {
  const { storageLocked, productionChoices, creatorRowLocked } = useContainerFormSections();
  const formLocked = storageLocked;
  const participantLocked = participantsReadOnly || storageLocked;

  return (
    <MilSection index={1} title="Thông tin thùng hàng">
      <MilGrid>
        {showBoxQuantity ? (
          <TextInput source="boxQuantity" label="Số lượng thùng" type="number" validate={[required(), positiveIntegerMax100]} disabled={formLocked} fullWidth />
        ) : null}
        <SelectInput source="containerType" label="Loại thùng" choices={[{ id: "CARTON", name: "Carton" }, { id: "PALLET_BOX", name: "Pallet box" }, { id: "PLASTIC_CONTAINER", name: "Container nhựa" }]} optionValue="id" optionText="name" validate={[required()]} disabled={formLocked} fullWidth />
        <TextInput source="weightPerBoxKg" label="Khối lượng mỗi thùng (kg)" type="number" validate={[required(), positiveNumber]} disabled={formLocked} fullWidth />
        <TextInput source="productName" label="Tên sản phẩm" validate={[required()]} disabled={formLocked} fullWidth />
        <SelectInput source="productionInventoryKey" label="Liên kết vụ mùa" choices={productionChoices} optionValue="id" optionText="name" validate={[required()]} disabled={formLocked} fullWidth />
        <div className="md:col-span-2">
          <ArrayInput source="participantRows" label="Đơn vị tham gia chuỗi">
            <SimpleFormIterator disableReordering disableAdd={participantLocked} disableRemove={participantLocked}>
              <FormDataConsumer>
                {() => <ParticipantRow disabled={participantLocked} creatorRowLocked={creatorRowLocked} />}
              </FormDataConsumer>
            </SimpleFormIterator>
          </ArrayInput>
        </div>
        <div className="md:col-span-2">
          <TextInput source="note" label="Ghi chú" multiline minRows={3} disabled={formLocked} fullWidth />
        </div>
      </MilGrid>
    </MilSection>
  );
}
