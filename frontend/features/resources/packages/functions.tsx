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
};

const quantityValidator = (value: unknown) => {
  const n = Number(value);
  if (!Number.isInteger(n)) return "Số lượng gói phải là số nguyên";
  if (n < 1 || n > 5) return "Số lượng gói từ 1 đến 5";
  return undefined;
};

function normalizeAgents(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x: any) => String(x?.walletAddress || "").trim())
    .filter(Boolean);
}

function PackageFormSections() {
  const productionInventoryKey = String(useWatch({ name: "productionInventoryKey" }) ?? "");
  const weightUnit = String(useWatch({ name: "weightUnit" }) ?? "");
  const agents = (useWatch({ name: "authorizedAgents" }) as Array<{ walletAddress?: string }> | undefined) ?? [];
  const { data: productions = [] } = useGetList<ProductionRow>("production", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "createdAt", order: "DESC" },
    filter: {},
  });
  const productionChoices = React.useMemo(
    () =>
      productions.map((p) => ({
        id: String(p.inventoryKey || ""),
        name: String(p.code || p.inventoryKey || ""),
      })),
    [productions],
  );
  const pickedProduction = React.useMemo(
    () => productions.find((p) => String(p.inventoryKey || "") === productionInventoryKey),
    [productions, productionInventoryKey],
  );

  const duplicateWallets = React.useMemo(() => {
    const arr = agents
      .map((x) => String(x?.walletAddress || "").trim())
      .filter(Boolean);
    return new Set(arr).size !== arr.length;
  }, [agents]);

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
            label="Mã vụ *"
            value={String(pickedProduction?.code || "")}
            disabled
            fullWidth
          />
          <MuiTextField
            label="PolicyID *"
            value={String(pickedProduction?.traceSchemeRef || "")}
            disabled
            fullWidth
          />
        </div>
      </div>

      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Quy cách đóng gói</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <NumberInput source="weightValue" label="Khối lượng mỗi gói" validate={[required()]} fullWidth />
          <SelectInput source="weightUnit" label="Đơn vị" choices={WEIGHT_UNIT_CHOICES} validate={[required()]} fullWidth />
          {weightUnit === "other" ? (
            <TextInput source="weightUnitOther" label="Đơn vị khác" validate={[required()]} fullWidth />
          ) : null}
          <NumberInput source="quantity" label="Số lượng gói" validate={[required(), quantityValidator]} fullWidth />
          <SelectInput source="packagingType" label="Loại đóng gói" choices={PACKAGING_TYPE_CHOICES} validate={[required()]} fullWidth />
          <DateInput source="packagingDate" label="Ngày đóng gói" validate={[required()]} fullWidth />
          <TextInput source="note" label="Ghi chú" multiline fullWidth />
        </div>
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
        <TextField source="production.code" label="Mã vụ" />
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
        return {
          productionInventoryKey: String(data?.productionInventoryKey || "").trim(),
          weightValue: Number(data?.weightValue),
          weightUnit: String(data?.weightUnit || "").trim(),
          weightUnitOther: String(data?.weightUnitOther || "").trim() || undefined,
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
        <PackageFormSections />
      </SimpleForm>
    </Create>
  );
}

