"use client";

import * as React from "react";
import {
  ArrayInput,
  Create,
  Datagrid,
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
  useGetList,
  required,
} from "react-admin";
import MuiTextField from "@mui/material/TextField";
import { useFormContext, useWatch } from "react-hook-form";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import type { ContainerStatus } from "./constants";
import {
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

const positiveNumber = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Phải lớn hơn 0";
  return undefined;
};

function ContainerFormSections() {
  const currentWalletAddress = String(useWatch({ name: "currentWalletAddress" }) ?? "");
  const linkedWalletAddressRows = (useWatch({ name: "linkedWalletAddressesExtra" }) as any[] | undefined) ?? [];
  const [locationRows, setLocationRows] = React.useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = React.useState(false);
  const { setValue, getValues } = useFormContext();
  const roadmapPreview = React.useMemo(() => {
    if (loadingLocations) return "Đang tải địa điểm...";
    if (!locationRows.length) return "Chưa có dữ liệu";
    return locationRows
      .map((x, idx) => {
        const locationLabel = [x.wardName, x.districtName, x.provinceName]
          .map((v: unknown) => String(v || "").trim())
          .filter(Boolean)
          .join(", ");
        const fallbackIds = [x.wardId, x.districtId, x.provinceId]
          .map((v: unknown) => String(v || "").trim())
          .filter(Boolean)
          .join("/");
        return `${idx + 1}. ${locationLabel || fallbackIds || "Chưa có địa điểm"}`;
      })
      .join("\n");
  }, [loadingLocations, locationRows]);

  const { data: productionRows = [] } = useGetList("production", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });

  const productionChoices = (productionRows || []).map((row: any) => ({
    id: String(row?.inventoryKey || row?.id || ""),
    name: `${String(row?.code || "")} - ${String(row?.inventoryKey || "").slice(0, 16)}...`,
  }));

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const json = (await res.json()) as any;
        const profile = json?.profile || {};
        const meWalletAddress = String(
          json?.user?.paymentAddress || json?.user?.walletAddress || json?.user?.sub || "",
        ).trim();
        if (!mounted) return;
        if (meWalletAddress) setValue("currentWalletAddress", meWalletAddress);
        const provinceId = String(getValues("currentProvinceId") || profile?.provinceId || "").trim();
        const districtId = String(getValues("currentDistrictId") || profile?.districtId || "").trim();
        const wardId = String(getValues("currentWardId") || profile?.wardId || "").trim();
        setValue("currentProvinceId", provinceId);
        setValue("currentDistrictId", districtId);
        setValue("currentWardId", wardId);
        const [provinceName, districtName, wardName] = await Promise.all([
          provinceId ? getProvinceNameById(provinceId) : Promise.resolve(""),
          districtId ? getDistrictNameById(districtId) : Promise.resolve(""),
          wardId ? getWardNameById(wardId) : Promise.resolve(""),
        ]);
        setValue(
          "currentLocationLabel",
          [wardName, districtName, provinceName].map((x) => String(x || "").trim()).filter(Boolean).join(", "),
        );
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getValues, setValue]);

  React.useEffect(() => {
    const extraAddresses = linkedWalletAddressRows
      .map((row) => String(row?.walletAddress ?? row ?? "").trim())
      .filter(Boolean);
    const addresses = [currentWalletAddress, ...extraAddresses].filter(Boolean);
    if (addresses.length === 0) {
      setLocationRows([]);
      setValue("routeMap", []);
      setValue("linkedWalletAddresses", []);
      return;
    }
    let mounted = true;
    setLoadingLocations(true);
    Promise.all(
      addresses.map(async (walletAddress) => {
        try {
          const res = await fetch(`${BACKEND_URL}/profile/public/${encodeURIComponent(walletAddress)}`, {
            method: "GET",
            credentials: "include",
          });
          const json = res.ok ? await res.json() : {};
          const profile = (json as any)?.profile ?? null;
          const provinceId = String(profile?.provinceId || "").trim();
          const districtId = String(profile?.districtId || "").trim();
          const wardId = String(profile?.wardId || "").trim();
          const [provinceName, districtName, wardName] = await Promise.all([
            provinceId ? getProvinceNameById(provinceId) : Promise.resolve(""),
            districtId ? getDistrictNameById(districtId) : Promise.resolve(""),
            wardId ? getWardNameById(wardId) : Promise.resolve(""),
          ]);
          return {
            walletAddress,
            provinceId,
            districtId,
            wardId,
            provinceName,
            districtName,
            wardName,
          };
        } catch {
          return {
            walletAddress,
            provinceId: "",
            districtId: "",
            wardId: "",
            provinceName: "",
            districtName: "",
            wardName: "",
          };
        }
      }),
    ).then((rows) => {
      if (!mounted) return;
      setLocationRows(rows);
      setValue("linkedWalletAddresses", rows.map((x) => String(x?.walletAddress || "").trim()).filter(Boolean));
      setValue("routeMap", rows);
      setLoadingLocations(false);
    });
    return () => {
      mounted = false;
    };
  }, [currentWalletAddress, linkedWalletAddressRows, setValue]);

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
          <TextInput source="capacityKg" label="Dung lượng chứa tối đa (kg)" type="number" validate={[positiveNumber]} fullWidth />
          <TextInput source="productName" label="Tên sản phẩm" fullWidth />
          <SelectInput
            source="productionInventoryKey"
            label="Liên kết vụ mùa"
            choices={productionChoices}
            validate={[required()]}
            fullWidth
          />
          <TextInput source="currentLocationLabel" label="Địa điểm hiện tại" disabled fullWidth />
          <TextInput source="note" label="Ghi chú" multiline minRows={3} fullWidth />
        </div>
      </div>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Đơn vị liên kết</h3>
        <TextInput source="currentWalletAddress" label="Địa chỉ ví hiện tại" disabled fullWidth />
        <ArrayInput source="linkedWalletAddressesExtra" label="Địa chỉ ví liên kết">
          <SimpleFormIterator>
            <TextInput source="walletAddress" label="Địa chỉ ví" fullWidth />
          </SimpleFormIterator>
        </ArrayInput>
        <MuiTextField
          label="Lộ trình địa chỉ liên kết"
          value={roadmapPreview}
          multiline
          minRows={4}
          fullWidth
          InputProps={{ readOnly: true }}
        />
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
  const status = (useWatch({ name: "status" }) as ContainerStatus | undefined) ?? "CREATE";
  const isConsumed = status === "CONSUMED";
  return (
    <Toolbar>
      {!isConsumed ? (
        <SaveButton
          label="Cập nhật"
          onClick={() => {
            setValue("status", "UPDATE");
          }}
        />
      ) : null}
      {!isConsumed ? (
        <SaveButton
          label="Xác nhận tiêu thụ"
          onClick={() => {
            setValue("status", "CONSUMED");
          }}
        />
      ) : null}
    </Toolbar>
  );
}

export function ContainerResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" label="Mã thùng" />
        <TextField source="containerType" label="Loại thùng" />
        <TextField source="capacityKg" label="Dung lượng chứa tối đa (kg)" />
        <TextField source="productName" label="Tên sản phẩm" />
        <TextField source="productionInventoryKey" label="InventoryKey vụ mùa" />
        <SelectField
          source="status"
          label="Trạng thái"
          choices={[
            { id: "CREATE", name: "Đã tạo" },
            { id: "UPDATE", name: "Đã cập nhật" },
            { id: "CONSUMED", name: "Đã tiêu thụ" },
          ]}
        />
        <TextField source="currentProvinceId" label="Tỉnh hiện tại" />
        <TextField source="currentDistrictId" label="Huyện hiện tại" />
        <TextField source="currentWardId" label="Xã hiện tại" />
      </Datagrid>
    </List>
  );
}

export function ContainerResourceCreate() {
  return (
    <Create
      transform={(data: any) => ({
        ...data,
        currentLocationLabel: undefined,
        currentWalletAddress: undefined,
        linkedWalletAddressesExtra: undefined,
        status: "CREATE",
        linkedWalletAddresses: [
          String(data?.currentWalletAddress || "").trim(),
          ...(Array.isArray(data?.linkedWalletAddressesExtra) ? data.linkedWalletAddressesExtra : []),
        ]
          .map((row: any) => String(row?.walletAddress ?? row ?? "").trim())
          .filter(Boolean),
        routeMap: Array.isArray(data?.routeMap) ? data.routeMap : [],
      })}
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
        toolbar={<ContainerCreateToolbar />}
        defaultValues={{
          code: makeContainerCode(),
          status: "CREATE",
          currentWalletAddress: "",
          linkedWalletAddressesExtra: [],
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
      transform={(data: any) => ({
        ...data,
        currentLocationLabel: undefined,
        currentWalletAddress: undefined,
        linkedWalletAddressesExtra: undefined,
        linkedWalletAddresses: [
          String(data?.currentWalletAddress || "").trim(),
          ...(Array.isArray(data?.linkedWalletAddressesExtra) ? data.linkedWalletAddressesExtra : []),
        ]
          .map((row: any) => String(row?.walletAddress ?? row ?? "").trim())
          .filter(Boolean),
        routeMap: Array.isArray(data?.routeMap) ? data.routeMap : [],
      })}
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
