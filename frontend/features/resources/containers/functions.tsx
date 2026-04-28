"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import MuiButton from "@mui/material/Button";
import QRCode from "qrcode";
import {
  ArrayInput,
  BooleanField,
  Create,
  Datagrid,
  DateField,
  DeleteButton,
  Edit,
  FunctionField,
  List,
  SaveButton,
  SelectField,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextField,
  TextInput,
  Toolbar,
  FormDataConsumer,
  useSimpleFormIteratorItem,
  useGetList,
  useRecordContext,
  required,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { getDistrictOptions, getProvinceOptions, getWardOptions, type Option } from "@/features/resources/shared/location";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function makeContainerCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `THUNG_${y}${m}${d}_${seq}`;
}

async function fetchCapacitySummary(
  productionInventoryKey: string,
  excludeContainerInventoryKey?: string,
): Promise<{ totalCapacityKg: number; usedCapacityKg: number; remainingCapacityKg: number }> {
  const key = String(productionInventoryKey || "").trim();
  if (!key) return { totalCapacityKg: 0, usedCapacityKg: 0, remainingCapacityKg: 0 };
  const query = new URLSearchParams({ productionInventoryKey: key });
  if (excludeContainerInventoryKey) query.set("excludeContainerInventoryKey", String(excludeContainerInventoryKey).trim());
  const res = await fetch(`${BACKEND_URL}/containers/capacity/summary?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { totalCapacityKg: number; usedCapacityKg: number; remainingCapacityKg: number };
}

const positiveNumber = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Phải lớn hơn 0";
  return undefined;
};

async function downloadContainerQr(record: any) {
  const qrText = String(record?.inventoryKey || record?.id || record?.code || "").trim();
  if (!qrText) return;
  const dataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 280 });
  const filename = `${String(record?.code || record?.id || "container").replace(/[^\w\-]+/g, "_")}_qr.png`;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function buildLocationLabelFromRow(row: any) {
  return [cleanString(row?.provinceId), cleanString(row?.districtId), cleanString(row?.wardId)]
    .filter(Boolean)
    .join(", ");
}

function parseLocationLabel(value: unknown) {
  const parts = cleanString(value)
    .split(",")
    .map((x) => cleanString(x));
  return {
    provinceId: parts[0] || "",
    districtId: parts[1] || "",
    wardId: parts[2] || "",
  };
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => cleanString(x)).filter(Boolean);
  const raw = cleanString(value);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => cleanString(x)).filter(Boolean);
  } catch {}
  return raw
    .split(";")
    .map((x) => cleanString(x))
    .filter(Boolean);
}

function normalizeParticipantRows(rowsRaw: unknown) {
  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  return rows
    .map((row: any) => ({
      walletAddress: cleanString(row?.walletAddress),
      provinceId: cleanString(row?.provinceId),
      districtId: cleanString(row?.districtId),
      wardId: cleanString(row?.wardId),
    }))
    .filter((row: any) => row.walletAddress);
}

function buildParticipantPayload(rowsRaw: unknown) {
  const normalized = normalizeParticipantRows(rowsRaw);
  const participantWalletAddresses = normalized.map((row: any) => cleanString(row?.walletAddress)).filter(Boolean);
  const participantLocationLabels = normalized.map((row: any) => buildLocationLabelFromRow(row));
  return { participantWalletAddresses, participantLocationLabels, participantRows: normalized };
}

function ParticipantAdministrativeAreaFields({ index, disabled = false }: { index: number; disabled?: boolean }) {
  const provinceName = `participantRows.${index}.provinceId`;
  const districtName = `participantRows.${index}.districtId`;
  const wardName = `participantRows.${index}.wardId`;
  const provinceId = String(useWatch({ name: provinceName }) ?? "");
  const districtId = String(useWatch({ name: districtName }) ?? "");
  const [provinces, setProvinces] = React.useState<Option[]>([]);
  const [districts, setDistricts] = React.useState<Option[]>([]);
  const [wards, setWards] = React.useState<Option[]>([]);
  React.useEffect(() => {
    let mounted = true;
    getProvinceOptions().then((rows) => mounted && setProvinces(rows)).catch(() => mounted && setProvinces([]));
    return () => { mounted = false; };
  }, []);
  React.useEffect(() => {
    let mounted = true;
    if (!provinceId) { setDistricts([]); setWards([]); return () => { mounted = false; }; }
    getDistrictOptions(provinceId).then((rows) => mounted && setDistricts(rows)).catch(() => mounted && setDistricts([]));
    return () => { mounted = false; };
  }, [provinceId]);
  React.useEffect(() => {
    let mounted = true;
    if (!districtId) { setWards([]); return () => { mounted = false; }; }
    getWardOptions(districtId).then((rows) => mounted && setWards(rows)).catch(() => mounted && setWards([]));
    return () => { mounted = false; };
  }, [districtId]);
  return (
    <>
      <SelectInput source="provinceId" label="Tỉnh/Thành" choices={provinces} optionValue="id" optionText="name" validate={[required()]} disabled={disabled} fullWidth />
      <SelectInput source="districtId" label="Quận/Huyện" choices={districts} optionValue="id" optionText="name" validate={[required()]} disabled={disabled || !provinceId} fullWidth />
      <SelectInput source="wardId" label="Phường/Xã" choices={wards} optionValue="id" optionText="name" validate={[required()]} disabled={disabled || !districtId} fullWidth />
    </>
  );
}

function AdditionalParticipantRow({ disabled = false }: { disabled?: boolean }) {
  const { index } = useSimpleFormIteratorItem();
  return (
    <>
      <TextInput
        source="walletAddress"
        label="Địa chỉ ví"
        validate={[required()]}
        disabled={disabled}
        fullWidth
      />
      <ParticipantAdministrativeAreaFields index={index} disabled={disabled} />
    </>
  );
}

function ContainerFormSections({ participantsReadOnly = false }: { participantsReadOnly?: boolean }) {
  const record = useRecordContext<any>();
  const storageLocked = Boolean(record?.storageLocked);
  const { getValues, setValue } = useFormContext();
  const currentInventoryKey = String(useWatch({ name: "inventoryKey" }) ?? "");
  const productionInventoryKey = String(useWatch({ name: "productionInventoryKey" }) ?? "");
  const capacityKg = String(useWatch({ name: "capacityKg" }) ?? "");
  const [capacitySummary, setCapacitySummary] = React.useState<{
    totalCapacityKg: number;
    usedCapacityKg: number;
    remainingCapacityKg: number;
  } | null>(null);

  const actualCapacityValidator = React.useCallback(
    (value: unknown) => {
      const actualRaw = String(value ?? "").trim();
      if (!actualRaw) return undefined;
      const maxRaw = String(capacityKg || "").trim();
      if (!maxRaw) return undefined;
      const actual = Number(actualRaw);
      const max = Number(maxRaw);
      if (!Number.isFinite(actual) || !Number.isFinite(max)) return undefined;
      if (actual > max) return "Dung lượng thực tế phải nhỏ hơn hoặc bằng dung lượng chứa tối đa.";
      return undefined;
    },
    [capacityKg],
  );

  React.useEffect(() => {
    const key = String(productionInventoryKey || "").trim();
    if (!key) {
      setCapacitySummary(null);
      return;
    }
    let mounted = true;
    fetchCapacitySummary(key)
      .then((x) => {
        if (!mounted) return;
        setCapacitySummary({
          totalCapacityKg: Number(x?.totalCapacityKg || 0),
          usedCapacityKg: Number(x?.usedCapacityKg || 0),
          remainingCapacityKg: Number(x?.remainingCapacityKg || 0),
        });
      })
      .catch(() => {
        if (!mounted) return;
        setCapacitySummary(null);
      });
    return () => {
      mounted = false;
    };
  }, [productionInventoryKey, currentInventoryKey]);

  const { data: productionRows = [] } = useGetList("production", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const productionChoices = (productionRows || [])
    .filter((row: any) => String(row?.status || "").toUpperCase() === "CLOSED")
    .map((row: any) => ({
      id: String(row?.inventoryKey || row?.id || ""),
      name: `${String(row?.code || "")} - ${String(row?.inventoryKey || "").slice(0, 16)}...`,
    }));

  React.useEffect(() => {
    let mounted = true;
    fetch(`${BACKEND_URL}/auth/me`, { method: "GET", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as any;
      })
      .then((meJson) => {
        if (!mounted || !meJson) return;
        const creatorWallet = cleanString(
          meJson?.user?.paymentAddress || meJson?.user?.walletAddress || meJson?.user?.sub || "",
        );
        if (!creatorWallet) return;
        const rowsRaw = getValues("participantRows");
        const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
        if (!rows.length) {
          setValue(
            "participantRows",
            [{ walletAddress: creatorWallet, provinceId: "", districtId: "", wardId: "" }],
            { shouldDirty: false, shouldValidate: false },
          );
          return;
        }
        const firstWallet = cleanString(rows?.[0]?.walletAddress);
        if (!firstWallet) {
          const nextRows = [...rows];
          nextRows[0] = { ...(nextRows[0] || {}), walletAddress: creatorWallet };
          setValue("participantRows", nextRows, { shouldDirty: false, shouldValidate: false });
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [getValues, setValue]);

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
          <SelectInput
            source="containerType"
            label="Loại thùng"
            choices={[
              { id: "CARTON", name: "Carton" },
              { id: "PALLET_BOX", name: "Pallet box" },
              { id: "PLASTIC_CONTAINER", name: "Container nhựa" },
            ]}
            validate={[required()]}
            fullWidth
          />
          <TextInput
            source="capacityKg"
            label="Dung lượng chứa tối đa (kg)"
            type="number"
            validate={[required(), positiveNumber]}
            fullWidth
          />
          <TextInput
            source="actualCapacityKg"
            label="Dung lượng thực tế (kg)"
            type="number"
            validate={[required(), positiveNumber, actualCapacityValidator]}
            fullWidth
          />
          <TextInput source="productName" label="Tên sản phẩm" validate={[required()]} fullWidth />
          <SelectInput
            source="productionInventoryKey"
            label="Liên kết vụ mùa"
            choices={productionChoices}
            validate={[required()]}
            fullWidth
          />
          <div className="md:col-span-2 text-sm text-slate-700">
            {capacitySummary
              ? `Đã tạo: ${capacitySummary.usedCapacityKg} kg | Còn lại: ${capacitySummary.remainingCapacityKg} kg`
              : "Đã tạo: 0 kg | Còn lại: 0 kg"}
          </div>
          <ArrayInput source="participantRows" label="Danh sách địa chỉ ví tham gia">
            <SimpleFormIterator
              disableReordering
              disableAdd={participantsReadOnly}
              disableRemove={participantsReadOnly}
            >
              <FormDataConsumer>{() => <AdditionalParticipantRow disabled={participantsReadOnly} />}</FormDataConsumer>
            </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="note" label="Ghi chú" multiline minRows={3} fullWidth />
        </div>
      </div>
    </>
  );
}

function ContainerCreateToolbar() {
  return (
    <Toolbar>
      <SaveButton label="Tạo thùng hàng" />
    </Toolbar>
  );
}

function ContainerEditToolbar() {
  const record = useRecordContext<any>();
  const storageLocked = Boolean(record?.storageLocked);
  const { setValue } = useFormContext();
  return (
    <Toolbar>
      <SaveButton
        label="Cập nhật"
        disabled={storageLocked}
        onClick={() => {
          setValue("status", "UPDATE");
        }}
      />
      <DeleteButton
        label="DELETE"
        mutationMode="pessimistic"
        redirect="list"
        color="error"
        disabled={storageLocked}
      />
    </Toolbar>
  );
}

export function ContainerResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã thùng" />
        <TextField source="containerType" label="Loại thùng" />
        <FunctionField
          label="QR"
          render={(record: any) => (
            <MuiButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                void downloadContainerQr(record);
              }}
            >
              Tải QR
            </MuiButton>
          )}
        />
        <SelectField
          source="status"
          label="Trạng thái"
          choices={[
            { id: "CREATE", name: "Đã tạo" },
            { id: "UPDATE", name: "Đã cập nhật" },
          ]}
        />
        <BooleanField source="verified" label="Đã xác thực" />
        <DateField source="verifiedAt" label="Thời gian xác thực" showTime />
      </Datagrid>
    </List>
  );
}

export function ContainerResourceCreate() {
  return (
    <Create
      transform={async (data: any) => {
        const code = String(data?.assetName || data?.code || "").trim() || makeContainerCode();
        const max = Number(String(data?.capacityKg || "").trim());
        const actual = Number(String(data?.actualCapacityKg || "").trim());
        if (Number.isFinite(max) && Number.isFinite(actual) && actual > max) {
          throw new Error("Dung lượng thực tế phải nhỏ hơn hoặc bằng dung lượng chứa tối đa.");
        }
        const summary = await fetchCapacitySummary(String(data?.productionInventoryKey || "").trim());
        if (actual > Number(summary?.remainingCapacityKg || 0)) {
          throw new Error(`Dung lượng thực tế vượt mức còn lại của vụ mùa. Còn lại: ${summary?.remainingCapacityKg || 0} kg.`);
        }
        const participants = buildParticipantPayload(data?.participantRows);
        return {
          ...data,
          code,
          assetName: undefined,
          participantWalletAddresses: participants.participantWalletAddresses,
          participantLocationLabels: participants.participantLocationLabels,
          participantRows: participants.participantRows,
          status: "CREATE",
        };
      }}
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
        toolbar={<ContainerCreateToolbar />}
        defaultValues={{
          assetName: makeContainerCode(),
          status: "CREATE",
        }}
      >
        <ContainerFormSections />
      </SimpleForm>
    </Create>
  );
}

export function ContainerResourceEdit() {
  return (
    <Edit
      mutationMode="pessimistic"
      sx={EDIT_PAGE_SX}
      transform={async (data: any) => {
        const max = Number(String(data?.capacityKg || "").trim());
        const actual = Number(String(data?.actualCapacityKg || "").trim());
        if (Number.isFinite(max) && Number.isFinite(actual) && actual > max) {
          throw new Error("Dung lượng thực tế phải nhỏ hơn hoặc bằng dung lượng chứa tối đa.");
        }
        const summary = await fetchCapacitySummary(
          String(data?.productionInventoryKey || "").trim(),
          String(data?.inventoryKey || "").trim(),
        );
        if (actual > Number(summary?.remainingCapacityKg || 0)) {
          throw new Error(`Dung lượng thực tế vượt mức còn lại của vụ mùa. Còn lại: ${summary?.remainingCapacityKg || 0} kg.`);
        }
        const participants = buildParticipantPayload(data?.participantRows);
        return {
          ...data,
          participantWalletAddresses: participants.participantWalletAddresses,
          participantLocationLabels: participants.participantLocationLabels,
          participantRows: participants.participantRows,
        };
      }}
    >
      <SimpleForm
        sx={FORM_SX}
        defaultValues={(record: any) => {
          const wallets = parseStringList(record?.participantWalletAddresses);
          const locations = parseStringList(record?.participantLocationLabels);
          const participantRows = wallets.map((wallet, index) => ({
            walletAddress: wallet,
            ...parseLocationLabel(locations[index]),
          }));
          return {
            ...record,
            participantRows,
          };
        }}
        toolbar={<ContainerEditToolbar />}
      >
        <ContainerFormSections participantsReadOnly />
      </SimpleForm>
    </Edit>
  );
}
