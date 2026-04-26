"use client";

import * as React from "react";
import MuiTextField from "@mui/material/TextField";
import QRCode from "qrcode";
import {
  ArrayInput,
  BooleanField,
  CreateButton,
  Create,
  Datagrid,
  DateField,
  Edit,
  Empty,
  List,
  SaveButton,
  SelectArrayInput,
  SelectField,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TopToolbar,
  TextField,
  TextInput,
  Toolbar,
  FunctionField,
  required,
  useGetList,
  useNotify,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { BACKEND_URL, SHIPMENT_STATUS_CHOICES } from "./constants";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import {
  getDistrictOptions,
  getProvinceOptions,
  getWardOptions,
  type Option,
} from "@/features/resources/shared/location";

type PackageRow = {
  id: string;
  inventoryKey?: string;
  code?: string;
  traceSchemeRef?: string;
};

type ShipmentRow = {
  code?: string;
  inventoryKey?: string;
  traceSchemeRef?: string;
};

type UpdaterLocationRow = {
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
};

function cleanString(value: unknown): string {
  return String(value || "").trim();
}

function normalizeAddresses(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x: any) => (typeof x === "string" ? x : x?.address))
    .map((x: any) => cleanString(x))
    .filter(Boolean);
}

function renderReadonlyAddressRows(values: string[], label: string) {
  const rows = (values || []).map((x) => cleanString(x)).filter(Boolean);
  if (rows.length === 0) {
    return <MuiTextField label={label} value="—" disabled fullWidth />;
  }
  return (
    <div className="grid grid-cols-1 gap-3">
      {rows.map((row, idx) => (
        <MuiTextField
          key={`${label}-${idx}`}
          label={idx === 0 ? label : undefined}
          value={row}
          disabled
          fullWidth
        />
      ))}
    </div>
  );
}

function resolveName(options: Option[], id: string): string {
  return options.find((x) => x.id === id)?.name || id;
}

function makeLocationLabel(
  provinceId: string,
  districtId: string,
  wardId: string,
  provinceOptions: Option[],
  districtOptions: Option[],
  wardOptions: Option[],
): string {
  const p = resolveName(provinceOptions, cleanString(provinceId));
  const d = resolveName(districtOptions, cleanString(districtId));
  const w = resolveName(wardOptions, cleanString(wardId));
  return [p, d, w].filter(Boolean).join("/") || "—";
}

function makeShipmentCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `LO_${y}${m}${d}_${seq}`;
}

async function downloadShipmentQr(record: ShipmentRow) {
  const code = cleanString(record?.code);
  const inventoryKey = cleanString(record?.inventoryKey);
  const policyId = cleanString(record?.traceSchemeRef);
  if (!code || !inventoryKey || !policyId) {
    throw new Error("Thiếu dữ liệu để tạo QR.");
  }
  const qrPayload = JSON.stringify({
    shipmentCode: code,
    inventoryKey,
    policyId,
  });
  const dataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 1 });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${code}-qr.png`;
  link.click();
}

function ShipmentCreateToolbar() {
  return (
    <Toolbar>
      <SaveButton label="Tạo lô hàng" />
    </Toolbar>
  );
}

function ShipmentCreateSections() {
  const notify = useNotify();
  const packageInventoryKeys = (useWatch({ name: "packageInventoryKeys" }) as string[] | undefined) ?? [];
  const updaterAddressesRaw = (useWatch({ name: "updaterAddresses" }) as Array<{ address?: string }> | undefined) ?? [];
  const { data: profileRows = [] } = useGetList<any>("profile", {
    pagination: { page: 1, perPage: 1 },
    sort: { field: "id", order: "ASC" },
    filter: {},
  });
  const profile = profileRows[0] ?? {};
  const [provinceOptions, setProvinceOptions] = React.useState<Option[]>([]);
  const [districtOptions, setDistrictOptions] = React.useState<Option[]>([]);
  const [wardOptions, setWardOptions] = React.useState<Option[]>([]);
  const [updaterLocationRows, setUpdaterLocationRows] = React.useState<UpdaterLocationRow[]>([]);
  const provinceId = cleanString(profile?.provinceId);
  const districtId = cleanString(profile?.districtId);
  const wardId = cleanString(profile?.wardId);

  React.useEffect(() => {
    getProvinceOptions().then(setProvinceOptions).catch(() => setProvinceOptions([]));
  }, []);
  React.useEffect(() => {
    if (!provinceId) {
      setDistrictOptions([]);
      return;
    }
    getDistrictOptions(provinceId).then(setDistrictOptions).catch(() => setDistrictOptions([]));
  }, [provinceId]);
  React.useEffect(() => {
    if (!districtId) {
      setWardOptions([]);
      return;
    }
    getWardOptions(districtId).then(setWardOptions).catch(() => setWardOptions([]));
  }, [districtId]);

  const baseLocation = React.useMemo(
    () => makeLocationLabel(provinceId, districtId, wardId, provinceOptions, districtOptions, wardOptions),
    [districtId, districtOptions, provinceId, provinceOptions, wardId, wardOptions],
  );
  const updaterAddresses = React.useMemo(() => normalizeAddresses(updaterAddressesRaw), [updaterAddressesRaw]);

  React.useEffect(() => {
    let mounted = true;
    if (updaterAddresses.length === 0) {
      setUpdaterLocationRows([]);
      return;
    }
    fetch(`${BACKEND_URL}/shipments/updater-locations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: updaterAddresses }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => []);
        if (!res.ok) throw new Error("Không lấy được location updater.");
        return Array.isArray(body) ? body : [];
      })
      .then((rows) => {
        if (!mounted) return;
        setUpdaterLocationRows(rows as any);
      })
      .catch(() => {
        if (!mounted) return;
        setUpdaterLocationRows([]);
      });
    return () => {
      mounted = false;
    };
  }, [updaterAddresses]);
  const updaterLocationMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const row of updaterLocationRows) {
      const addr = cleanString(row?.address);
      if (!addr) continue;
      const location = makeLocationLabel(
        row?.provinceId,
        row?.districtId,
        row?.wardId,
        provinceOptions,
        districtOptions,
        wardOptions,
      );
      map.set(addr, location);
    }
    return map;
  }, [districtOptions, provinceOptions, updaterLocationRows, wardOptions]);

  const orderedRoadmap = React.useMemo(
    () => [baseLocation, ...updaterAddresses.map((addr) => updaterLocationMap.get(addr) || addr)].filter(Boolean),
    [baseLocation, updaterAddresses, updaterLocationMap],
  );
  const { data: packageRows = [] } = useGetList<PackageRow>("packages", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "createdAt", order: "DESC" },
    filter: {},
  });
  const packageChoices = React.useMemo(
    () =>
      packageRows.map((row) => ({
        id: cleanString(row.inventoryKey || row.id),
        name: cleanString(row.code || row.inventoryKey),
      })),
    [packageRows],
  );
  const selectedPolicyIds = React.useMemo(() => {
    const selected = new Set(packageInventoryKeys.map((x) => String(x)));
    const rows = packageRows
      .filter((x) => selected.has(String(x.inventoryKey || "")))
      .map((x) => cleanString(x.traceSchemeRef))
      .filter(Boolean);
    return Array.from(new Set(rows));
  }, [packageInventoryKeys, packageRows]);

  React.useEffect(() => {
    if (packageInventoryKeys.length === 0) return;
    if (selectedPolicyIds.length > 0) return;
    notify("Một số gói không hợp lệ với holder hiện tại.", { type: "warning" });
  }, [notify, packageInventoryKeys, selectedPolicyIds.length]);

  return (
    <>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[1] Chọn gói hàng</h3>
        <SelectArrayInput
          source="packageInventoryKeys"
          label="Gói hàng"
          choices={packageChoices}
          optionValue="id"
          optionText="name"
          validate={[required()]}
          fullWidth
        />
        <MuiTextField
          label="PolicyID"
          value={selectedPolicyIds.join("\n")}
          multiline
          minRows={Math.max(2, Math.min(selectedPolicyIds.length || 1, 6))}
          disabled
          fullWidth
        />
      </div>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Quyền cập nhật vị trí</h3>
        <ArrayInput source="updaterAddresses" label="Địa chỉ được phép cập nhật location">
          <SimpleFormIterator inline>
            <TextInput source="address" label="Địa chỉ ví" fullWidth />
          </SimpleFormIterator>
        </ArrayInput>
      </div>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[3] Thông tin lô hàng</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput source="code" label="Mã lô *" disabled fullWidth />
          <MuiTextField
            label="Vị trí hiện tại"
            value={baseLocation}
            disabled
            fullWidth
          />
          {renderReadonlyAddressRows(orderedRoadmap.map((x, idx) => `${idx + 1}. ${x}`), "Roadmap")}
          <TextInput source="note" label="Ghi chú" multiline fullWidth />
        </div>
      </div>
    </>
  );
}

function ShipmentEditSections() {
  const record = useRecordContext<any>();
  const packageKeys = Array.isArray(record?.packageInventoryKeys) ? record.packageInventoryKeys : [];
  const roadmap = Array.isArray(record?.roadmap) ? record.roadmap : [];
  const updaters = Array.isArray(record?.updaterAddresses) ? record.updaterAddresses : [];
  const orderedRoadmap = roadmap
    .map((x: any) => String(x || "").trim())
    .filter(Boolean)
    .map((x: string, idx: number) => `${idx + 1}. ${x}`);

  return (
    <>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[1] Lô hàng</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput source="code" label="Mã lô" disabled fullWidth />
          <TextInput source="traceSchemeRef" label="Mã chính sách" disabled fullWidth />
          <TextInput source="inventoryKey" label="Inventory Key" disabled fullWidth />
          <TextInput source="holderAddress" label="Holder hiện tại" disabled fullWidth />
          <SelectInput source="status" label="Trạng thái" choices={SHIPMENT_STATUS_CHOICES} disabled fullWidth />
        </div>
      </div>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Gói liên kết</h3>
        {renderReadonlyAddressRows(packageKeys, "Danh sách package inventory key")}
      </div>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[3] Quyền cập nhật vị trí</h3>
        {renderReadonlyAddressRows(updaters, "Địa chỉ được phép")}
        <TextInput source="location" label="Vị trí hiện tại" disabled fullWidth />
        {renderReadonlyAddressRows(orderedRoadmap, "Roadmap hiện tại")}
      </div>
    </>
  );
}

export function ShipmentsResourceList() {
  const { permissions } = usePermissions<string>();
  const notify = useNotify();
  const isEnterprise = permissions === "ENTERPRISE";
  return (
    <List
      empty={<Empty hasCreate={isEnterprise} />}
      exporter={false}
      actions={isEnterprise ? <TopToolbar><CreateButton /></TopToolbar> : false}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" label="Mã lô" />
        <TextField source="holderAddress" label="Holder" />
        <DateField source="createdAt" label="Ngày đóng lô" showTime />
        <SelectField source="status" label="Trạng thái" choices={SHIPMENT_STATUS_CHOICES} />
        <BooleanField source="verified" label="Đã xác thực" />
        <DateField source="verifiedAt" label="Thời gian xác thực" showTime />
        <FunctionField
          label="QR"
          render={(record: any) => (
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={async () => {
                try {
                  await downloadShipmentQr(record as ShipmentRow);
                } catch (e: any) {
                  notify(String(e?.message || "Tải QR thất bại."), { type: "error" });
                }
              }}
            >
              Tải QR
            </button>
          )}
        />
      </Datagrid>
    </List>
  );
}

export function ShipmentsResourceCreate() {
  return (
    <Create
      sx={CREATE_PAGE_SX}
      transform={(data: any) => ({
        packageInventoryKeys: Array.isArray(data?.packageInventoryKeys)
          ? data.packageInventoryKeys.map((x: any) => String(x || "").trim()).filter(Boolean)
          : [],
        updaterAddresses: normalizeAddresses(data?.updaterAddresses),
        note: String(data?.note || "").trim() || undefined,
      })}
    >
      <SimpleForm
        sx={FORM_SX}
        toolbar={<ShipmentCreateToolbar />}
        defaultValues={{
          code: makeShipmentCode(),
          packageInventoryKeys: [],
          updaterAddresses: [],
        }}
      >
        <ShipmentCreateSections />
      </SimpleForm>
    </Create>
  );
}

export function ShipmentsResourceEdit() {
  return (
    <Edit mutationMode="pessimistic" sx={EDIT_PAGE_SX}>
      <SimpleForm sx={FORM_SX} toolbar={false}>
        <ShipmentEditSections />
      </SimpleForm>
    </Edit>
  );
}
