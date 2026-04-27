"use client";

import * as React from "react";
import {
  ArrayInput,
  BooleanField,
  Create,
  Datagrid,
  DateField,
  DeleteButton,
  Edit,
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
  required,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import {
  captureCurrentGpsLocation,
} from "@/features/resources/shared/location";
import { AdministrativeAreaFields } from "@/features/resources/shared/areaFields";

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

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function buildLocationLabelFromRow(row: any) {
  return [cleanString(row?.provinceId), cleanString(row?.districtId), cleanString(row?.wardId)]
    .filter(Boolean)
    .join(", ");
}

function normalizeParticipantRows(rowsRaw: unknown, ownerWalletRaw: unknown) {
  const ownerWallet = cleanString(ownerWalletRaw);
  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  const cleaned = rows
    .map((row: any) => ({
      walletAddress: cleanString(row?.walletAddress),
      provinceId: cleanString(row?.provinceId),
      districtId: cleanString(row?.districtId),
      wardId: cleanString(row?.wardId),
    }))
    .filter((row: any) => row.walletAddress);
  const seen = new Set<string>();
  const uniqueRows: any[] = [];
  for (const row of cleaned) {
    const key = row.walletAddress.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueRows.push(row);
  }
  const ownerRow =
    uniqueRows.find((row) => row.walletAddress.toLowerCase() === ownerWallet.toLowerCase()) ||
    {
      walletAddress: ownerWallet,
      provinceId: "",
      districtId: "",
      wardId: "",
    };
  const otherRows = uniqueRows.filter((row) => row.walletAddress.toLowerCase() !== ownerWallet.toLowerCase());
  return ownerWallet ? [ownerRow, ...otherRows] : uniqueRows;
}

function buildParticipantPayload(rowsRaw: unknown, ownerWalletRaw: unknown) {
  const normalized = normalizeParticipantRows(rowsRaw, ownerWalletRaw);
  const participantWalletAddresses = normalized.map((row: any) => cleanString(row?.walletAddress)).filter(Boolean);
  const participantLocationLabels = normalized.map((row: any) => buildLocationLabelFromRow(row));
  return { participantWalletAddresses, participantLocationLabels, participantRows: normalized };
}

function AdditionalParticipantRow({ ownerWallet }: { ownerWallet: string }) {
  const { index } = useSimpleFormIteratorItem();
  const isOwner = index === 0;

  return (
    <>
      <TextInput
        source="walletAddress"
        label={index === 0 ? "Địa chỉ ví chủ thể" : "Địa chỉ ví"}
        validate={[required()]}
        disabled={isOwner}
        fullWidth
      />
      <AdministrativeAreaFields
        provinceSource="provinceId"
        districtSource="districtId"
        wardSource="wardId"
        watchProvinceSource={`participantRows.${index}.provinceId`}
        watchDistrictSource={`participantRows.${index}.districtId`}
        setDistrictSource={`participantRows.${index}.districtId`}
        setWardSource={`participantRows.${index}.wardId`}
        requiredAll={false}
        cascadeResetOnParentChange={false}
      />
    </>
  );
}

function ContainerFormSections() {
  const currentInventoryKey = String(useWatch({ name: "inventoryKey" }) ?? "");
  const productionInventoryKey = String(useWatch({ name: "productionInventoryKey" }) ?? "");
  const capacityKg = String(useWatch({ name: "capacityKg" }) ?? "");
  const formOwnerWallet = cleanString(useWatch({ name: "registeringCustodianAddress" }) ?? "");
  const participantRows = useWatch({ name: "participantRows" }) as unknown;
  const { setValue } = useFormContext();
  const [ownerWallet, setOwnerWallet] = React.useState("");
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
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((json: any) => {
        if (!mounted) return;
        const owner =
          cleanString(json?.user?.paymentAddress) ||
          cleanString(json?.user?.walletAddress) ||
          cleanString(json?.user?.address) ||
          cleanString(json?.user?.sub) ||
          formOwnerWallet;
        setOwnerWallet(owner);
      })
      .catch(() => {
        if (!mounted) return;
        setOwnerWallet(formOwnerWallet);
      });
    return () => {
      mounted = false;
    };
  }, [formOwnerWallet]);

  React.useEffect(() => {
    if (!ownerWallet) return;
    const normalized = normalizeParticipantRows(participantRows, ownerWallet);
    const nextRows = normalized.length
      ? normalized.map((row: any, idx: number) =>
          idx === 0 ? { ...row, walletAddress: ownerWallet } : row,
        )
      : [{ walletAddress: ownerWallet, provinceId: "", districtId: "", wardId: "" }];
    if (JSON.stringify(nextRows) !== JSON.stringify(Array.isArray(participantRows) ? participantRows : [])) {
      setValue("participantRows", nextRows, { shouldDirty: false, shouldValidate: false });
    }
  }, [ownerWallet, participantRows, setValue]);

  return (
    <>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[1] Thông tin thùng hàng</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput source="code" label="Mã thùng *" disabled fullWidth />
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
          <AdministrativeAreaFields
            provinceSource="currentProvinceId"
            districtSource="currentDistrictId"
            wardSource="currentWardId"
            provinceLabel="Tỉnh/Thành hiện tại"
            districtLabel="Quận/Huyện hiện tại"
            wardLabel="Phường/Xã hiện tại"
            requiredAll={false}
            disabled
          />
          <ArrayInput source="participantRows" label="Danh sách địa chỉ ví tham gia">
            <SimpleFormIterator disableReordering>
              <FormDataConsumer>{() => <AdditionalParticipantRow ownerWallet={ownerWallet} />}</FormDataConsumer>
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
  const { setValue } = useFormContext();
  return (
    <Toolbar>
      <SaveButton
        label="Cập nhật"
        onClick={() => {
          setValue("status", "UPDATE");
        }}
      />
      <DeleteButton label="DELETE" mutationMode="pessimistic" redirect="list" color="error" />
    </Toolbar>
  );
}

export function ContainerResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" label="Mã thùng" />
        <TextField source="containerType" label="Loại thùng" />
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
        const code = String(data?.code || "").trim() || makeContainerCode();
        const max = Number(String(data?.capacityKg || "").trim());
        const actual = Number(String(data?.actualCapacityKg || "").trim());
        if (Number.isFinite(max) && Number.isFinite(actual) && actual > max) {
          throw new Error("Dung lượng thực tế phải nhỏ hơn hoặc bằng dung lượng chứa tối đa.");
        }
        const gps = await captureCurrentGpsLocation();
        const summary = await fetchCapacitySummary(String(data?.productionInventoryKey || "").trim());
        if (actual > Number(summary?.remainingCapacityKg || 0)) {
          throw new Error(`Dung lượng thực tế vượt mức còn lại của vụ mùa. Còn lại: ${summary?.remainingCapacityKg || 0} kg.`);
        }
        const ownerWallet =
          cleanString(data?.registeringCustodianAddress) ||
          cleanString(data?.participantRows?.[0]?.walletAddress);
        const participants = buildParticipantPayload(data?.participantRows, ownerWallet);
        return {
          ...data,
          code,
          participantWalletAddresses: participants.participantWalletAddresses,
          participantLocationLabels: participants.participantLocationLabels,
          participantRows: participants.participantRows,
          currentProvinceId: gps.provinceId,
          currentDistrictId: gps.districtId,
          currentWardId: gps.wardId,
          locationProofLat: String(gps.lat),
          locationProofLng: String(gps.lng),
          locationProofAccuracyM: gps.accuracyM === null ? "" : String(gps.accuracyM),
          locationProofTimestampIso: gps.timestampIso,
          status: "CREATE",
        };
      }}
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
        toolbar={<ContainerCreateToolbar />}
        defaultValues={{
          code: makeContainerCode(),
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
        const gps = await captureCurrentGpsLocation();
        const summary = await fetchCapacitySummary(
          String(data?.productionInventoryKey || "").trim(),
          String(data?.inventoryKey || "").trim(),
        );
        if (actual > Number(summary?.remainingCapacityKg || 0)) {
          throw new Error(`Dung lượng thực tế vượt mức còn lại của vụ mùa. Còn lại: ${summary?.remainingCapacityKg || 0} kg.`);
        }
        const ownerWallet =
          cleanString(data?.registeringCustodianAddress) ||
          cleanString(data?.participantRows?.[0]?.walletAddress);
        const participants = buildParticipantPayload(data?.participantRows, ownerWallet);
        return {
          ...data,
          participantWalletAddresses: participants.participantWalletAddresses,
          participantLocationLabels: participants.participantLocationLabels,
          participantRows: participants.participantRows,
          currentProvinceId: gps.provinceId,
          currentDistrictId: gps.districtId,
          currentWardId: gps.wardId,
          locationProofLat: String(gps.lat),
          locationProofLng: String(gps.lng),
          locationProofAccuracyM: gps.accuracyM === null ? "" : String(gps.accuracyM),
          locationProofTimestampIso: gps.timestampIso,
        };
      }}
    >
      <SimpleForm
        sx={FORM_SX}
        toolbar={<ContainerEditToolbar />}
      >
        <ContainerFormSections />
      </SimpleForm>
    </Edit>
  );
}
