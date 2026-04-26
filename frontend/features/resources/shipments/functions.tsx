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
  useRefresh,
  useUpdate,
  useDelete,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { BACKEND_URL, SHIPMENT_STATUS_CHOICES } from "./constants";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import {
  getDistrictOptions,
  getDistrictNameById,
  getProvinceOptions,
  getProvinceNameById,
  getWardOptions,
  getWardNameById,
  type Option,
} from "@/features/resources/shared/location";

type PackageRow = {
  id: string;
  inventoryKey?: string;
  code?: string;
  traceSchemeRef?: string;
  packagingDate?: string;
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
    <div className="max-h-72 overflow-y-auto pr-1">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {rows.map((row, idx) => (
        <MuiTextField
          key={`${label}-${idx}`}
          label={idx === 0 ? label : undefined}
          value={row}
          disabled
          fullWidth
          size="small"
        />
      ))}
      </div>
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

async function resolveLocationDisplay(raw: unknown): Promise<string> {
  const value = cleanString(raw);
  if (!value) return "—";
  const parts = value.split("/").map((x) => cleanString(x)).filter(Boolean);
  if (parts.length !== 3) return value;
  const [p, d, w] = await Promise.all([
    getProvinceNameById(parts[0]),
    getDistrictNameById(parts[1]),
    getWardNameById(parts[2]),
  ]);
  return [p || parts[0], d || parts[1], w || parts[2]].join("/");
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
  const [updaterLocationMap, setUpdaterLocationMap] = React.useState<Record<string, string>>({});

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
  React.useEffect(() => {
    let mounted = true;
    if (updaterLocationRows.length === 0) {
      setUpdaterLocationMap({});
      return;
    }
    (async () => {
      const entries = await Promise.all(
        updaterLocationRows.map(async (row) => {
          const addr = cleanString(row?.address);
          if (!addr) return null;
          const [p, d, w] = await Promise.all([
            getProvinceNameById(cleanString(row?.provinceId)),
            getDistrictNameById(cleanString(row?.districtId)),
            getWardNameById(cleanString(row?.wardId)),
          ]);
          const location = [p || cleanString(row?.provinceId), d || cleanString(row?.districtId), w || cleanString(row?.wardId)]
            .filter(Boolean)
            .join("/") || addr;
          return [addr, location] as const;
        }),
      );
      if (!mounted) return;
      const next: Record<string, string> = {};
      for (const item of entries) {
        if (!item) continue;
        next[item[0]] = item[1];
      }
      setUpdaterLocationMap(next);
    })();
    return () => {
      mounted = false;
    };
  }, [updaterLocationRows]);

  const orderedRoadmap = React.useMemo(
    () => [baseLocation, ...updaterAddresses.map((addr) => updaterLocationMap[addr] || addr)].filter(Boolean),
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
  const packageMap = React.useMemo(() => {
    const map = new Map<string, PackageRow>();
    for (const row of packageRows) {
      const key = cleanString(row.inventoryKey || row.id);
      if (!key) continue;
      map.set(key, row);
    }
    return map;
  }, [packageRows]);
  const shipmentDate = React.useMemo(() => new Date(), []);
  const dateValidationErrors = React.useMemo(() => {
    const errors: string[] = [];
    for (const key of packageInventoryKeys) {
      const packageKey = cleanString(key);
      const pkg = packageMap.get(packageKey);
      if (!pkg) continue;
      const packagingDateRaw = cleanString(pkg.packagingDate);
      const packagingDate = packagingDateRaw ? new Date(packagingDateRaw) : null;
      if (!packagingDate || Number.isNaN(packagingDate.getTime())) {
        errors.push(`Gói ${cleanString(pkg.code || packageKey)} thiếu ngày đóng gói hợp lệ.`);
        continue;
      }
      if (shipmentDate.getTime() < packagingDate.getTime()) {
        errors.push(`Lô hiện tại có ngày đóng lô < ngày đóng gói của ${cleanString(pkg.code || packageKey)}.`);
      }
    }
    return errors;
  }, [packageInventoryKeys, packageMap, shipmentDate]);
  const validateShipmentPackageDates = React.useCallback(
    (value: unknown) => {
      const selected = Array.isArray(value) ? value.map((x) => cleanString(x)).filter(Boolean) : [];
      if (selected.length < 1) return "Phải chọn ít nhất 1 gói hàng.";
      return dateValidationErrors.length > 0 ? dateValidationErrors[0] : undefined;
    },
    [dateValidationErrors],
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
          validate={[required(), validateShipmentPackageDates]}
          fullWidth
        />
        {dateValidationErrors.length > 0 ? (
          <p className="mt-2 text-sm text-red-600">{dateValidationErrors[0]}</p>
        ) : null}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ArrayInput source="updaterAddresses" label="Địa chỉ được phép cập nhật location">
            <SimpleFormIterator inline>
              <TextInput source="address" label="Địa chỉ ví" fullWidth />
            </SimpleFormIterator>
          </ArrayInput>
        </div>
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
  const { permissions } = usePermissions<string>();
  const packageKeys = Array.isArray(record?.packageInventoryKeys) ? record.packageInventoryKeys : [];
  const packageCodes = Array.isArray(record?.packageCodes) ? record.packageCodes : [];
  const roadmap = Array.isArray(record?.roadmap) ? record.roadmap : [];
  const updaters = Array.isArray(record?.updaterAddresses) ? record.updaterAddresses : [];
  const [locationDisplay, setLocationDisplay] = React.useState<string>("—");
  const [roadmapDisplay, setRoadmapDisplay] = React.useState<string[]>([]);
  const [actorAddress, setActorAddress] = React.useState("");
  const packageDisplayRows = packageCodes.length > 0 ? packageCodes : packageKeys;
  const status = cleanString(record?.status).toUpperCase();
  const isEnterprise = permissions === "ENTERPRISE";
  const isHolder = cleanString(record?.holderAddress) === actorAddress;
  const canEditShipment = isEnterprise && isHolder && status === "CREATED";

  React.useEffect(() => {
    let mounted = true;
    fetch(`${BACKEND_URL}/auth/me`, { method: "GET", credentials: "include" })
      .then((res) => res.json().catch(() => ({})))
      .then((json: any) => {
        if (!mounted) return;
        const user = json?.user ?? {};
        const actor = String(user?.walletAddress || user?.paymentAddress || user?.sub || "").trim();
        setActorAddress(actor);
      })
      .catch(() => {
        if (!mounted) return;
        setActorAddress("");
      });
    return () => {
      mounted = false;
    };
  }, []);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const loc = await resolveLocationDisplay(record?.location);
      const rowsRaw = Array.isArray(roadmap) ? roadmap : [];
      const rowsResolved = await Promise.all(rowsRaw.map((x: any) => resolveLocationDisplay(x)));
      if (!mounted) return;
      setLocationDisplay(loc);
      setRoadmapDisplay(rowsResolved.map((x, idx) => `${idx + 1}. ${x}`));
    })();
    return () => {
      mounted = false;
    };
  }, [record?.location, roadmap]);

  return (
    <>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[1] Lô hàng</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput source="code" label="Mã lô" disabled fullWidth />
          <TextInput source="traceSchemeRef" label="Mã chính sách" disabled fullWidth />
          <SelectInput source="status" label="Trạng thái" choices={SHIPMENT_STATUS_CHOICES} disabled fullWidth />
          <TextInput source="location" label="Vị trí hiện tại" disabled={!canEditShipment} fullWidth />
          <TextInput source="note" label="Ghi chú" multiline disabled={!canEditShipment} fullWidth />
        </div>
      </div>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Gói liên kết</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderReadonlyAddressRows(packageDisplayRows, "Mã gói liên kết")}
        </div>
      </div>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[3] Quyền cập nhật vị trí</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderReadonlyAddressRows(updaters, "Địa chỉ được phép")}
          <MuiTextField label="Vị trí đã resolve" value={locationDisplay} disabled fullWidth />
          {renderReadonlyAddressRows(roadmapDisplay, "Roadmap hiện tại")}
        </div>
      </div>
    </>
  );
}

function ShipmentEditToolbar() {
  const record = useRecordContext<any>();
  const { permissions } = usePermissions<string>();
  const status = cleanString(record?.status).toUpperCase();
  const isEnterprise = permissions === "ENTERPRISE";
  const [actorAddress, setActorAddress] = React.useState("");
  const isHolder = cleanString(record?.holderAddress) === actorAddress;
  const canEditShipment = isEnterprise && isHolder && status === "CREATED";

  React.useEffect(() => {
    let mounted = true;
    fetch(`${BACKEND_URL}/auth/me`, { method: "GET", credentials: "include" })
      .then((res) => res.json().catch(() => ({})))
      .then((json: any) => {
        if (!mounted) return;
        const user = json?.user ?? {};
        const actor = String(user?.walletAddress || user?.paymentAddress || user?.sub || "").trim();
        setActorAddress(actor);
      })
      .catch(() => {
        if (!mounted) return;
        setActorAddress("");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!canEditShipment) return false as any;
  return (
    <Toolbar>
      <SaveButton label="Lưu thay đổi" />
    </Toolbar>
  );
}

export function ShipmentsResourceList() {
  const { permissions } = usePermissions<string>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [update, { isPending }] = useUpdate();
  const [deleteOne, { isPending: deleting }] = useDelete();
  const isEnterprise = permissions === "ENTERPRISE";
  const [actorAddress, setActorAddress] = React.useState("");
  React.useEffect(() => {
    let mounted = true;
    fetch(`${BACKEND_URL}/auth/me`, { method: "GET", credentials: "include" })
      .then((res) => res.json().catch(() => ({})))
      .then((json: any) => {
        if (!mounted) return;
        const user = json?.user ?? {};
        const actor = String(user?.walletAddress || user?.paymentAddress || user?.sub || "").trim();
        setActorAddress(actor);
      })
      .catch(() => {
        if (!mounted) return;
        setActorAddress("");
      });
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <List
      empty={<Empty hasCreate={isEnterprise} />}
      exporter={false}
      actions={isEnterprise ? <TopToolbar><CreateButton /></TopToolbar> : false}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" label="Mã lô" />
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
        <FunctionField
          label="Action"
          render={(record: any) => {
            const status = cleanString(record?.status).toUpperCase();
            const isHolder = String(record?.holderAddress || "").trim() === actorAddress;
            if (!isEnterprise || !isHolder) return "—";
            const disabledDispatch = status === "IN_TRANSIT";
            return (
              <button
                type="button"
                className="text-blue-600 underline disabled:opacity-50"
                disabled={isPending || disabledDispatch}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  update(
                    "shipments",
                    {
                      id: record?.inventoryKey || record?.id,
                      data: { inventoryKey: record?.inventoryKey, status: "IN_TRANSIT" },
                      previousData: record,
                    },
                    {
                      onSuccess: () => {
                        notify("Đã xuất kho", { type: "success" });
                        refresh();
                      },
                      onError: (error: any) =>
                        notify(String(error?.message || "Xuất kho thất bại."), { type: "error" }),
                    },
                  );
                }}
              >
                Xuất kho
              </button>
            );
          }}
        />
        <FunctionField
          label="Xóa"
          render={(record: any) => {
            const isHolder = String(record?.holderAddress || "").trim() === actorAddress;
            if (!isEnterprise || !isHolder) return "—";
            return (
              <button
                type="button"
                className="text-red-600 underline disabled:opacity-50"
                disabled={deleting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteOne(
                    "shipments",
                    { id: record?.inventoryKey || record?.id, previousData: record },
                    {
                      onSuccess: () => {
                        notify("Đã gửi yêu cầu xóa, chờ verify burn on-chain.", { type: "success" });
                        refresh();
                      },
                      onError: (error: any) =>
                        notify(String(error?.message || "Xóa lô hàng thất bại."), { type: "error" }),
                    },
                  );
                }}
              >
                Xóa
              </button>
            );
          }}
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
      <SimpleForm sx={FORM_SX} toolbar={<ShipmentEditToolbar />}>
        <ShipmentEditSections />
      </SimpleForm>
    </Edit>
  );
}
