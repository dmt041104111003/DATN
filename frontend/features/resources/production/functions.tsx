"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import {
  BooleanField,
  CheckboxGroupInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  FileField,
  FileInput,
  List,
  SaveButton,
  SelectField,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  Toolbar,
  FunctionField,
  useDelete,
  useNotify,
  useRefresh,
  useSaveContext,
  required,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import {
  CERTIFICATIONS,
  type Option,
  type ProductionStatus,
} from "./constants";
import {
  getDistrictOptions,
  getProvinceOptions,
  getWardOptions,
} from "@/features/resources/shared/location";
import {
  CREATE_PAGE_SX,
  EDIT_PAGE_SX,
  FORM_SX,
} from "@/features/resources/shared/styles";

function makeProductionCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `VU_${y}${m}${d}_${seq}`;
}

const positiveNumber = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Phải lớn hơn 0";
  return undefined;
};

function ProductionFormSections() {
  const { setValue } = useFormContext();
  const status = (useWatch({ name: "status" }) as ProductionStatus | undefined) ?? "DRAFT";
  const provinceId = String(useWatch({ name: "provinceId" }) ?? "");
  const districtId = String(useWatch({ name: "districtId" }) ?? "");
  const varietyId = String(useWatch({ name: "varietyId" }) ?? "");
  const certifications = (useWatch({ name: "certifications" }) as string[] | undefined) ?? [];
  const hasOtherCertification = certifications.includes("other");

  const isDraft = status === "DRAFT";
  const fullyLocked = status === "CLOSED";
  const lockedCore = !isDraft;
  const [provinceOptions, setProvinceOptions] = React.useState<Option[]>([]);
  const [districtOptions, setDistrictOptions] = React.useState<Option[]>([]);
  const [wardOptions, setWardOptions] = React.useState<Option[]>([]);
  const prevProvinceRef = React.useRef<string>("");
  const prevDistrictRef = React.useRef<string>("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const rows = await getProvinceOptions();
      if (mounted) setProvinceOptions(rows);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!provinceId) {
        setDistrictOptions([]);
        return;
      }
      const rows = await getDistrictOptions(provinceId);
      if (mounted) setDistrictOptions(rows);
    })();
    return () => {
      mounted = false;
    };
  }, [provinceId]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!districtId) {
        setWardOptions([]);
        return;
      }
      const rows = await getWardOptions(districtId);
      if (mounted) setWardOptions(rows);
    })();
    return () => {
      mounted = false;
    };
  }, [districtId]);

  React.useEffect(() => {
    if (!prevProvinceRef.current) {
      prevProvinceRef.current = provinceId;
      return;
    }
    if (prevProvinceRef.current !== provinceId) {
      setValue("districtId", "");
      setValue("wardId", "");
      prevProvinceRef.current = provinceId;
    }
  }, [provinceId, setValue]);

  React.useEffect(() => {
    if (!prevDistrictRef.current) {
      prevDistrictRef.current = districtId;
      return;
    }
    if (prevDistrictRef.current !== districtId) {
      setValue("wardId", "");
      prevDistrictRef.current = districtId;
    }
  }, [districtId, setValue]);

  return (
    <>
      {fullyLocked ? (
        <div className="mb-3 inline-flex rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          Đã thu hoạch
        </div>
      ) : null}
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[1] Thông tin vụ sản xuất</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput source="code" label="Mã vụ *" disabled fullWidth />
          <TextInput
            source="facilityId"
            label="Tên cơ sở sản xuất"
            disabled={lockedCore}
            validate={[required()]}
            fullWidth
          />
          <SelectInput
            source="provinceId"
            label="Tỉnh/Thành"
            choices={provinceOptions}
            optionValue="id"
            optionText="name"
            disabled={lockedCore}
            validate={[required()]}
            fullWidth
          />
          <SelectInput
            source="districtId"
            label="Quận/Huyện"
            choices={districtOptions}
            optionValue="id"
            optionText="name"
            disabled={lockedCore || !provinceId}
            validate={[required()]}
            fullWidth
          />
          <SelectInput
            source="wardId"
            label="Xã/Phường"
            choices={wardOptions}
            optionValue="id"
            optionText="name"
            disabled={lockedCore || !districtId}
            validate={[required()]}
            fullWidth
          />
          <SelectInput
            source="farmingMethod"
            label="Phương thức canh tác"
            choices={[
              { id: "GREENHOUSE", name: "Nhà kính" },
              { id: "OUTDOOR", name: "Ngoài trời" },
              { id: "HYDROPONIC", name: "Thủy canh" },
            ]}
            disabled={lockedCore}
            validate={[required()]}
            fullWidth
          />
          <DateInput
            source="seedingDate"
            label="Ngày gieo trồng"
            disabled={lockedCore}
            validate={[required()]}
            fullWidth
          />
          {fullyLocked ? (
            <DateInput
              source="harvestDate"
              label="Ngày thu hoạch"
              disabled
              fullWidth
            />
          ) : null}
        </div>
      </div>

      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Thông tin cây trồng</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            source="cropType"
            label="Loại cây"
            disabled={lockedCore}
            validate={[required()]}
            fullWidth
          />
          <TextInput
            source="varietyId"
            label="Giống"
            disabled={fullyLocked || (lockedCore && Boolean(varietyId))}
            fullWidth
          />
          <TextInput
            source="expectedYieldKg"
            label="Sản lượng dự kiến (kg)"
            type="number"
            disabled={fullyLocked}
            validate={[positiveNumber]}
            fullWidth
          />
          {!isDraft ? (
            <TextInput
              source="actualYieldKg"
              label="Sản lượng thực tế (kg)"
              type="number"
              disabled
              fullWidth
            />
          ) : null}
        </div>
      </div>

      {!isDraft ? (
        <div id="production-evidence-section" className="py-1">
        <h3 className="mb-4 font-semibold">[3] Thông tin chứng nhận & minh chứng</h3>
        <div className="grid grid-cols-1 gap-4">
          <div id="production-cert-section">
            <CheckboxGroupInput
              source="certifications"
              label="Chứng nhận"
              choices={CERTIFICATIONS}
              optionValue="id"
              optionText="name"
              disabled={fullyLocked}
            />
          </div>
          {hasOtherCertification ? (
            <TextInput
              source="customCertificationName"
              label="Tên chứng nhận khác"
              disabled={fullyLocked}
              validate={[required()]}
              fullWidth
            />
          ) : null}
          <FileInput source="evidenceFiles" label="Ảnh minh chứng (nhiều ảnh)" multiple disabled={fullyLocked}>
            <FileField source="title" title="title" />
          </FileInput>
          <TextInput source="note" label="Ghi chú" multiline disabled={fullyLocked} fullWidth />
        </div>
      </div>
      ) : null}
    </>
  );
}

function ProductionCreateToolbar() {
  return (
    <Toolbar>
      <SaveButton label="Tạo vụ" />
    </Toolbar>
  );
}

function ProductionEditToolbar() {
  const {
    setValue,
    getValues,
    formState: { dirtyFields },
  } = useFormContext();
  const { save } = useSaveContext();
  const status = (useWatch({ name: "status" }) as ProductionStatus | undefined) ?? "DRAFT";
  const verified = Boolean(useWatch({ name: "verified" }));
  const [harvestModalOpen, setHarvestModalOpen] = React.useState(false);
  const [harvestInput, setHarvestInput] = React.useState("");
  const [actualYieldInput, setActualYieldInput] = React.useState("");

  if (status !== "ACTIVE") return null;
  const dirtyMap = (dirtyFields || {}) as Record<string, unknown>;
  const dirtyKeys = Object.keys(dirtyMap);
  const excludedDirtyKeys = new Set([
    "harvestDate",
    "actualYieldKg",
    "status",
    "verified",
    "verifiedAt",
    "id",
    "inventoryKey",
    "traceSchemeRef",
    "code",
    "createdAt",
    "updatedAt",
  ]);
  const hasNonHarvestChanges = dirtyKeys.some((key) => !excludedDirtyKeys.has(key));
  const canUpdate = verified && hasNonHarvestChanges;
  const canHarvest = verified && !canUpdate;

  return (
    <>
      <Toolbar>
        <SaveButton
          label="Cập nhật thông tin"
          disabled={!canUpdate}
          onClick={() => setValue("status", "ACTIVE")}
        />
        <Button
          variant="contained"
          disableElevation
          type="button"
          disabled={!canHarvest}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setHarvestInput("");
            setActualYieldInput("");
            setHarvestModalOpen(true);
          }}
        >
          Xác nhận thu hoạch
        </Button>
      </Toolbar>
      {harvestModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded bg-white p-4">
            <h4 className="mb-3 text-base font-semibold">Xác nhận thu hoạch</h4>
            <label className="mb-2 block text-sm">Ngày thu hoạch</label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2"
              value={harvestInput}
              onChange={(e) => setHarvestInput(e.target.value)}
            />
            <label className="mb-2 mt-3 block text-sm">Sản lượng thực tế (kg)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded border px-3 py-2"
              value={actualYieldInput}
              onChange={(e) => setActualYieldInput(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-1.5" onClick={() => setHarvestModalOpen(false)}>
                Hủy
              </button>
              <Button
                variant="contained"
                disableElevation
                type="button"
                onClick={(e) => {
                  const nextValues = {
                    ...getValues(),
                    harvestDate: harvestInput,
                    actualYieldKg: String(actualYieldInput).trim(),
                    status: "CLOSED",
                  };
                  setValue("harvestDate", harvestInput, { shouldDirty: true, shouldValidate: true });
                  setValue("actualYieldKg", String(actualYieldInput).trim(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("status", "CLOSED", { shouldDirty: true, shouldValidate: true });
                  setHarvestModalOpen(false);
                  save?.(nextValues);
                }}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ProductionResourceList() {
  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: deleting }] = useDelete();

  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" label="Mã vụ" />
        <TextField source="facilityId" label="Cơ sở" />
        <TextField source="cropType" label="Loại cây" />
        <SelectField
          source="status"
          label="Trạng thái"
          choices={[
            { id: "ACTIVE", name: "Đang hoạt động" },
            { id: "CLOSED", name: "Đã đóng vụ" },
          ]}
        />
        <BooleanField source="verified" label="Đã xác thực" />
        <DateField source="verifiedAt" label="Thời gian xác thực" showTime />
        <DateField source="seedingDate" label="Ngày gieo" />
        <DateField source="harvestDate" label="Ngày thu hoạch" />
        <TextField source="actualYieldKg" label="Sản lượng thực tế (kg)" />
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
                    "production",
                    { id: record?.inventoryKey || record?.id, previousData: record },
                    {
                      onSuccess: () => {
                        notify("Đã gửi yêu cầu xóa, chờ verify burn on-chain.", { type: "success" });
                        refresh();
                      },
                      onError: (error: any) =>
                        notify(String(error?.message || "Xóa vụ sản xuất thất bại."), { type: "error" }),
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

export function ProductionResourceCreate() {
  return (
    <Create
      transform={(data: any) => ({
        ...data,
        status: "ACTIVE",
        harvestDate: null,
        certifications: [],
        certFiles: [],
        evidenceFiles: [],
      })}
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
        defaultValues={{
          code: makeProductionCode(),
          status: "DRAFT",
          certFiles: [],
          evidenceFiles: [],
        }}
        toolbar={<ProductionCreateToolbar />}
      >
        <ProductionFormSections />
      </SimpleForm>
    </Create>
  );
}

export function ProductionResourceEdit() {
  return (
    <Edit
      mutationMode="pessimistic"
      sx={EDIT_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
        toolbar={<ProductionEditToolbar />}
      >
        <ProductionFormSections />
      </SimpleForm>
    </Edit>
  );
}
