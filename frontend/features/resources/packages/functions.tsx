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
  DateInput,
  Edit,
  Empty,
  List,
  NumberField,
  NumberInput,
  SelectField,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TopToolbar,
  FunctionField,
  TextField,
  TextInput,
  required,
  useGetList,
  useNotify,
  usePermissions,
  useRedirect,
} from "react-admin";
import {
  PACKAGE_STATUS_CHOICES,
  PACKAGING_TYPE_CHOICES,
  WEIGHT_UNIT_CHOICES,
} from "./constants";
import { useWatch } from "react-hook-form";
import {
  CREATE_PAGE_SX,
  EDIT_PAGE_SX,
  FORM_SX,
} from "@/features/resources/shared/styles";

type ProductionRow = {
  id: string;
  inventoryKey?: string;
  code?: string;
  traceSchemeRef?: string;
  status?: string;
};

type CapacityResponse = {
  totalYieldKg?: number;
  packagedKg?: number;
  remainingKg?: number;
  canPackage?: boolean;
  message?: string;
};

type PackageRow = {
  code?: string;
  inventoryKey?: string;
  traceSchemeRef?: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function clampQuantity(value: unknown) {
  if (value === null || value === undefined || value === "") return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n > 5) return 5;
  if (n < 1) return 1;
  return Math.trunc(n);
}

function toKg(weightValueRaw: unknown, weightUnitRaw: unknown, quantityRaw: unknown): number | null {
  const weightValue = Number(weightValueRaw);
  const quantity = Number(quantityRaw);
  const unit = String(weightUnitRaw || "").trim().toLowerCase();
  if (!Number.isFinite(weightValue) || weightValue <= 0 || !Number.isFinite(quantity) || quantity <= 0) return null;
  if (unit === "kg") return weightValue * quantity;
  if (unit === "gram") return (weightValue * quantity) / 1000;
  return null;
}

function normalizeAgents(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x: any) => String(x?.walletAddress || "").trim())
    .filter(Boolean);
}

async function downloadPackageQr(record: PackageRow) {
  const code = String(record?.code || "").trim();
  const inventoryKey = String(record?.inventoryKey || "").trim();
  const policyId = String(record?.traceSchemeRef || "").trim();
  if (!code || !inventoryKey || !policyId) {
    throw new Error("Thiếu dữ liệu để tạo QR.");
  }
  const qrPayload = JSON.stringify({
    packageCode: code,
    inventoryKey,
    policyId,
  });
  const dataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 1 });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${code}-qr.png`;
  link.click();
}

function PackageFormSections({
  onCapacityChange,
}: {
  onCapacityChange?: (value: number | null) => void;
}) {
  const productionInventoryKey = String(useWatch({ name: "productionInventoryKey" }) ?? "");
  const weightValue = useWatch({ name: "weightValue" });
  const weightUnit = String(useWatch({ name: "weightUnit" }) ?? "");
  const quantity = useWatch({ name: "quantity" });
  const agents = (useWatch({ name: "authorizedAgents" }) as Array<{ walletAddress?: string }> | undefined) ?? [];
  const [capacity, setCapacity] = React.useState<CapacityResponse | null>(null);
  const [capacityLoading, setCapacityLoading] = React.useState(false);
  const [capacityError, setCapacityError] = React.useState("");
  const { data: productions = [] } = useGetList<ProductionRow>("production", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "createdAt", order: "DESC" },
    filter: { status: "CLOSED" },
  });
  const closedProductions = React.useMemo(
    () => productions.filter((p) => String(p.status || "").toUpperCase() === "CLOSED"),
    [productions],
  );
  const productionChoices = React.useMemo(
    () =>
      closedProductions.map((p) => ({
        id: String(p.inventoryKey || ""),
        name: String(p.code || p.inventoryKey || ""),
      })),
    [closedProductions],
  );
  const pickedProduction = React.useMemo(
    () => closedProductions.find((p) => String(p.inventoryKey || "") === productionInventoryKey),
    [closedProductions, productionInventoryKey],
  );
  const requestedKg = React.useMemo(
    () => toKg(weightValue, weightUnit, quantity),
    [weightValue, weightUnit, quantity],
  );
  const remainingKg = Number(capacity?.remainingKg ?? 0);
  const willExceed = requestedKg !== null && requestedKg > remainingKg + 1e-9;

  const duplicateWallets = React.useMemo(() => {
    const arr = agents
      .map((x) => String(x?.walletAddress || "").trim())
      .filter(Boolean);
    return new Set(arr).size !== arr.length;
  }, [agents]);

  React.useEffect(() => {
    let mounted = true;
    if (!productionInventoryKey) {
      setCapacity(null);
      setCapacityError("");
      onCapacityChange?.(null);
      return;
    }
    setCapacityLoading(true);
    setCapacityError("");
    fetch(`${BACKEND_URL}/packages/capacity/${encodeURIComponent(productionInventoryKey)}`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((body as any)?.message || "Không lấy được sản lượng còn lại."));
        return body as CapacityResponse;
      })
      .then((data) => {
        if (!mounted) return;
        setCapacity(data);
        const remain = Number(data?.remainingKg);
        onCapacityChange?.(Number.isFinite(remain) ? remain : null);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setCapacity(null);
        setCapacityError(String(e?.message || "Không lấy được sản lượng còn lại."));
        onCapacityChange?.(null);
      })
      .finally(() => {
        if (!mounted) return;
        setCapacityLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [onCapacityChange, productionInventoryKey]);

  return (
    <>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[1] Nguồn sản xuất</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectInput
            source="productionInventoryKey"
            label="Vụ sản xuất"
            choices={productionChoices}
            optionValue="id"
            optionText="name"
            validate={[required()]}
            fullWidth
          />
          <MuiTextField
            label="PolicyID *"
            value={String(pickedProduction?.traceSchemeRef || "")}
            disabled
            fullWidth
          />
        </div>
        {capacityLoading ? (
          <p className="mt-2 text-sm text-slate-600">Đang tính sản lượng còn lại...</p>
        ) : null}
        {!capacityLoading && capacity ? (
          <p className="mt-2 text-sm text-slate-700">
            Sản lượng còn lại: <b>{Number(capacity.remainingKg || 0).toFixed(3)} kg</b> (Tổng:{" "}
            {Number(capacity.totalYieldKg || 0).toFixed(3)} kg, đã đóng gói: {Number(capacity.packagedKg || 0).toFixed(3)} kg)
          </p>
        ) : null}
        {capacityError ? <p className="mt-2 text-sm text-red-600">{capacityError}</p> : null}
      </div>

      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Quy cách đóng gói</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <NumberInput source="weightValue" label="Khối lượng mỗi gói" validate={[required()]} fullWidth />
          <SelectInput source="weightUnit" label="Đơn vị" choices={WEIGHT_UNIT_CHOICES} validate={[required()]} fullWidth />
          <NumberInput
            source="quantity"
            label="Số lượng gói"
            parse={clampQuantity}
            min={1}
            max={5}
            step={1}
            fullWidth
          />
          <SelectInput source="packagingType" label="Loại đóng gói" choices={PACKAGING_TYPE_CHOICES} validate={[required()]} fullWidth />
          <DateInput source="packagingDate" label="Ngày đóng gói" validate={[required()]} fullWidth />
          <TextInput source="note" label="Ghi chú" multiline fullWidth />
        </div>
        {requestedKg !== null ? (
          <p className={`mt-2 text-sm ${willExceed ? "text-red-600" : "text-slate-700"}`}>
            Khối lượng đóng gói lần này: {requestedKg.toFixed(3)} kg
          </p>
        ) : null}
        {willExceed ? <p className="mt-1 text-sm text-red-600">Vượt quá sản lượng còn lại, không thể tạo gói.</p> : null}
      </div>

      <div className="py-1">
        <h3 className="mb-4 font-semibold">[3] Quyền tiêu thụ</h3>
        <ArrayInput source="authorizedAgents" label="Ví đại lý được phép bán">
          <SimpleFormIterator inline>
            <TextInput source="walletAddress" label="Địa chỉ ví đại lý" fullWidth />
          </SimpleFormIterator>
        </ArrayInput>
        {duplicateWallets ? <p className="text-sm text-red-600">Danh sách ví đang bị trùng.</p> : null}
      </div>
    </>
  );
}

export function PackagesResourceList() {
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
        <TextField source="code" label="Mã gói" />
        <NumberField source="weightValue" label="Khối lượng" />
        <TextField source="weightUnit" label="Đơn vị" />
        <NumberField source="quantity" label="Số lượng gói" />
        <TextField source="packagingType" label="Loại đóng gói" />
        <DateField source="packagingDate" label="Ngày đóng gói" />
        <SelectField source="status" label="Trạng thái" choices={PACKAGE_STATUS_CHOICES} />
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
                  await downloadPackageQr(record as PackageRow);
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

export function PackagesResourceEdit() {
  return (
    <Edit sx={EDIT_PAGE_SX}>
      <SimpleForm sx={FORM_SX} toolbar={false}>
        <div className="py-1">
          <h3 className="mb-4 font-semibold">[1] Nguồn sản xuất</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput source="productionCode" label="Vụ sản xuất" disabled fullWidth />
            <TextInput source="traceSchemeRef" label="Mã chính sách" disabled fullWidth />
          </div>
        </div>
        <div className="py-1">
          <h3 className="mb-4 font-semibold">[2] Quy cách đóng gói</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput source="code" label="Mã gói" disabled fullWidth />
            <NumberInput source="weightValue" label="Khối lượng mỗi gói" disabled fullWidth />
            <TextInput source="weightUnit" label="Đơn vị" disabled fullWidth />
            <NumberInput source="quantity" label="Số lượng gói" disabled fullWidth />
            <TextInput source="packagingType" label="Loại đóng gói" disabled fullWidth />
            <DateInput source="packagingDate" label="Ngày đóng gói" disabled fullWidth />
            <TextInput source="note" label="Ghi chú" multiline disabled fullWidth />
            <SelectInput source="status" label="Trạng thái" choices={PACKAGE_STATUS_CHOICES} disabled fullWidth />
          </div>
        </div>
        <div className="py-1">
          <h3 className="mb-4 font-semibold">[3] Quyền tiêu thụ</h3>
          <FunctionField
            label="Địa chỉ ví đại lý"
            render={(record: any) => {
              const agents = Array.isArray(record?.authorizedAgents)
                ? record.authorizedAgents.map((x: any) => String(x || "").trim()).filter(Boolean)
                : [];
              if (agents.length === 0) {
                return <MuiTextField value="—" disabled fullWidth />;
              }
              return (
                <div className="grid grid-cols-1 gap-3">
                  {agents.map((addr: string, idx: number) => (
                    <MuiTextField
                      key={`${addr}-${idx}`}
                      label={idx === 0 ? "Địa chỉ ví đại lý" : undefined}
                      value={addr}
                      disabled
                      fullWidth
                    />
                  ))}
                </div>
              );
            }}
          />
        </div>
      </SimpleForm>
    </Edit>
  );
}

export function PackagesResourceCreate() {
  const notify = useNotify();
  const redirect = useRedirect();
  const [remainingKg, setRemainingKg] = React.useState<number | null>(null);
  return (
    <Create
      mutationOptions={{
        onSuccess: (data: any) => {
          const count = Number(data?.createdCount || 1);
          notify(`Đã tạo ${count} gói thành công`, { type: "success" });
          redirect("list", "packages");
        },
      }}
      transform={(data: any) => {
        const agents = normalizeAgents(data?.authorizedAgents);
        const uniqueAgents = Array.from(new Set(agents));
        if (uniqueAgents.length !== agents.length) {
          throw new Error("Ví đại lý bị trùng.");
        }
        const requestKg = toKg(data?.weightValue, data?.weightUnit, data?.quantity);
        if (requestKg === null) {
          throw new Error("Chỉ hỗ trợ đơn vị kg/gram để kiểm tra sản lượng còn lại.");
        }
        const quantity = Number(data?.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
          throw new Error("Số lượng gói phải từ 1 đến 5.");
        }
        if (remainingKg === null) {
          throw new Error("Không lấy được dữ liệu sản lượng còn lại.");
        }
        if (requestKg > remainingKg + 1e-9) {
          throw new Error(`Vượt quá sản lượng còn lại (${remainingKg.toFixed(3)} kg).`);
        }
        return {
          productionInventoryKey: String(data?.productionInventoryKey || "").trim(),
          weightValue: Number(data?.weightValue),
          weightUnit: String(data?.weightUnit || "").trim(),
          quantity,
          packagingType: String(data?.packagingType || "").trim(),
          packagingDate: data?.packagingDate,
          note: String(data?.note || "").trim() || undefined,
          authorizedAgents: uniqueAgents,
        };
      }}
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
        defaultValues={{
          productionInventoryKey: "",
          weightUnit: "gram",
          quantity: 1,
          authorizedAgents: [{ walletAddress: "" }],
        }}
      >
        <PackageFormSections onCapacityChange={setRemainingKg} />
      </SimpleForm>
    </Create>
  );
}

