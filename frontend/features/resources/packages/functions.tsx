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
  useRefresh,
  useRedirect,
  useDelete,
  Toolbar,
  SaveButton,
  useRecordContext,
} from "react-admin";
import {
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
  harvestDate?: string;
};

type PackageRow = {
  code?: string;
  inventoryKey?: string;
  traceSchemeRef?: string;
};

function normalizeAgents(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x: any) => String(x?.walletAddress || "").trim())
    .filter(Boolean);
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
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
  onSelectedHarvestDateChange,
}: {
  onSelectedHarvestDateChange?: (value: string) => void;
}) {
  const productionInventoryKey = String(useWatch({ name: "productionInventoryKey" }) ?? "");
  const agents = (useWatch({ name: "authorizedAgents" }) as Array<{ walletAddress?: string }> | undefined) ?? [];
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
  const selectedHarvestDate = String(pickedProduction?.harvestDate || "").trim();
  const validatePackagingDate = React.useCallback((value: unknown) => {
    if (!value) return "Bắt buộc.";
    const packagingDate = new Date(String(value));
    if (!isValidDate(packagingDate)) return "Ngày đóng gói không hợp lệ.";
    if (selectedHarvestDate) {
      const harvestDate = new Date(selectedHarvestDate);
      if (isValidDate(harvestDate) && packagingDate.getTime() < harvestDate.getTime()) {
        return "Ngày đóng gói phải lớn hơn hoặc bằng ngày thu hoạch.";
      }
    }
    return undefined;
  }, [selectedHarvestDate]);

  const duplicateWallets = React.useMemo(() => {
    const arr = agents
      .map((x) => String(x?.walletAddress || "").trim())
      .filter(Boolean);
    return new Set(arr).size !== arr.length;
  }, [agents]);

  React.useEffect(() => {
    onSelectedHarvestDateChange?.(selectedHarvestDate);
  }, [onSelectedHarvestDateChange, selectedHarvestDate]);

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
      </div>

      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Quy cách đóng gói</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DateInput source="packagingDate" label="Ngày đóng gói" validate={[required(), validatePackagingDate]} fullWidth />
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
  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: deleting }] = useDelete();
  return (
    <List
      empty={<Empty hasCreate />}
      exporter={false}
      actions={<TopToolbar><CreateButton /></TopToolbar>}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" label="Mã gói" />
        <DateField source="packagingDate" label="Ngày đóng gói" />
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
        <FunctionField
          label="Xóa"
          render={(record: any) => {
            return (
              <button
                type="button"
                className="text-red-600 underline disabled:opacity-50"
                disabled={deleting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteOne(
                    "packages",
                    { id: record?.inventoryKey || record?.id, previousData: record },
                    {
                      onSuccess: () => {
                        notify("Đã gửi yêu cầu xóa, chờ verify burn on-chain.", { type: "success" });
                        refresh();
                      },
                      onError: (error: any) =>
                        notify(String(error?.message || "Xóa gói hàng thất bại."), { type: "error" }),
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

export function PackagesResourceEdit() {
  const PackageEditToolbar = () => (
    <Toolbar>
      <SaveButton label="Lưu thay đổi" />
    </Toolbar>
  );

  const EditFields = () => {
    return (
      <>
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
            <DateInput source="packagingDate" label="Ngày đóng gói" disabled fullWidth />
            <TextInput source="note" label="Ghi chú" multiline fullWidth />
          </div>
        </div>
      </>
    );
  };

  return (
    <Edit sx={EDIT_PAGE_SX}>
      <SimpleForm sx={FORM_SX} toolbar={<PackageEditToolbar />}>
        <EditFields />
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
  const [selectedHarvestDate, setSelectedHarvestDate] = React.useState<string>("");
  return (
    <Create
      mutationOptions={{
        onSuccess: () => {
          notify("Đã tạo gói thành công", { type: "success" });
          redirect("list", "packages");
        },
      }}
      transform={(data: any) => {
        const agents = normalizeAgents(data?.authorizedAgents);
        const uniqueAgents = Array.from(new Set(agents));
        if (uniqueAgents.length !== agents.length) {
          throw new Error("Ví đại lý bị trùng.");
        }
        const packagingDate = data?.packagingDate ? new Date(String(data.packagingDate)) : null;
        const harvestDate = selectedHarvestDate ? new Date(selectedHarvestDate) : null;
        if (!packagingDate || !isValidDate(packagingDate)) {
          throw new Error("Ngày đóng gói không hợp lệ.");
        }
        if (harvestDate && isValidDate(harvestDate) && packagingDate.getTime() < harvestDate.getTime()) {
          throw new Error("Ngày đóng gói phải lớn hơn hoặc bằng ngày thu hoạch.");
        }
        return {
          productionInventoryKey: String(data?.productionInventoryKey || "").trim(),
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
          authorizedAgents: [{ walletAddress: "" }],
        }}
      >
        <PackageFormSections
          onSelectedHarvestDateChange={setSelectedHarvestDate}
        />
      </SimpleForm>
    </Create>
  );
}

