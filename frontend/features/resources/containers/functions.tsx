"use client";

import * as React from "react";
import {
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
  TextField,
  TextInput,
  Toolbar,
  useGetList,
  required,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import {
  captureCurrentGpsLocation,
  getDistrictNameById,
  getProvinceNameById,
  getWardNameById,
} from "@/features/resources/shared/location";

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

function ContainerFormSections({ mode }: { mode: "create" | "edit" }) {
  const isEditForm = mode === "edit";
  const currentInventoryKey = String(useWatch({ name: "inventoryKey" }) ?? "");
  const productionInventoryKey = String(useWatch({ name: "productionInventoryKey" }) ?? "");
  const currentProvinceId = String(useWatch({ name: "currentProvinceId" }) ?? "");
  const currentDistrictId = String(useWatch({ name: "currentDistrictId" }) ?? "");
  const currentWardId = String(useWatch({ name: "currentWardId" }) ?? "");
  const capacityKg = String(useWatch({ name: "capacityKg" }) ?? "");
  const { setValue } = useFormContext();
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

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const [provinceName, districtName, wardName] = await Promise.all([
        currentProvinceId ? getProvinceNameById(currentProvinceId) : Promise.resolve(""),
        currentDistrictId ? getDistrictNameById(currentDistrictId) : Promise.resolve(""),
        currentWardId ? getWardNameById(currentWardId) : Promise.resolve(""),
      ]);
      if (!mounted) return;
      setValue("currentProvinceName", provinceName || currentProvinceId || "");
      setValue("currentDistrictName", districtName || currentDistrictId || "");
      setValue("currentWardName", wardName || currentWardId || "");
    })();
    return () => {
      mounted = false;
    };
  }, [currentProvinceId, currentDistrictId, currentWardId, setValue]);

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
          <TextInput source="currentProvinceName" label="Tỉnh/Thành hiện tại" disabled fullWidth />
          <TextInput source="currentDistrictName" label="Quận/Huyện hiện tại" disabled fullWidth />
          <TextInput source="currentWardName" label="Phường/Xã hiện tại" disabled fullWidth />
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
        return {
          ...data,
          code,
          currentProvinceName: undefined,
          currentDistrictName: undefined,
          currentWardName: undefined,
          currentLocationLabel: undefined,
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
        <ContainerFormSections mode="create" />
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
        return {
          ...data,
          currentProvinceName: undefined,
          currentDistrictName: undefined,
          currentWardName: undefined,
          currentLocationLabel: undefined,
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
        <ContainerFormSections mode="edit" />
      </SimpleForm>
    </Edit>
  );
}
