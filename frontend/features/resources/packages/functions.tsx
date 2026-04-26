"use client";

import * as React from "react";
import MuiTextField from "@mui/material/TextField";
import {
  ArrayInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Empty,
  List,
  NumberField,
  NumberInput,
  SelectField,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextField,
  TextInput,
  required,
  useGetList,
  useNotify,
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

const quantityValidator = (value: unknown) => {
  const n = Number(value);
  if (!Number.isInteger(n)) return "Số lượng gói phải là số nguyên";
  if (n < 1 || n > 5) return "Số lượng gói từ 1 đến 5";
  return undefined;
};

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
          <NumberInput source="quantity" label="Số lượng gói" validate={[required(), quantityValidator]} fullWidth />
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
  return (
    <List empty={<Empty />}>
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <TextField source="code" label="Mã gói" />
        <NumberField source="weightValue" label="Khối lượng" />
        <TextField source="weightUnit" label="Đơn vị" />
        <NumberField source="quantity" label="Số lượng gói" />
        <TextField source="packagingType" label="Loại đóng gói" />
        <DateField source="packagingDate" label="Ngày đóng gói" />
        <SelectField source="status" label="Trạng thái" choices={PACKAGE_STATUS_CHOICES} />
      </Datagrid>
    </List>
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
          quantity: Number(data?.quantity),
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

