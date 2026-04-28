"use client";

import {
  CheckboxGroupInput,
  DateInput,
  FileField,
  FileInput,
  required,
  SelectInput,
  TextInput,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { positiveNumber } from "@/features/resources/shared/numberHelpers";
import { CERTIFICATIONS } from "./constants";
import { ProductionAdministrativeAreaFields } from "./ProductionAdministrativeAreaFields";

export function ProductionFormSections() {
  const watchedStatus = useWatch({ name: "status" });
  const watchedVarietyId = useWatch({ name: "varietyId" });
  const watchedCertifications = useWatch({ name: "certifications" });
  const status = String(watchedStatus ?? "CREATED");
  const varietyId = String(watchedVarietyId ?? "");
  const certifications = Array.isArray(watchedCertifications) ? watchedCertifications : [];
  const hasOtherCertification = certifications.includes("other");
  const fullyLocked = status === "CLOSED";
  const lockedCore = fullyLocked;

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
          <TextInput source="code" label="Mã vụ mùa *" disabled fullWidth />
          <TextInput
            source="facilityId"
            label="Tên cơ sở sản xuất"
            disabled={lockedCore}
            validate={[required()]}
            fullWidth
          />
          <ProductionAdministrativeAreaFields disabled={lockedCore} />
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
          {fullyLocked ? (
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
          <FileInput
            source="evidenceFiles"
            label="Ảnh minh chứng (nhiều ảnh)"
            multiple
            disabled={fullyLocked}
          >
            <FileField source="title" title="title" />
          </FileInput>
          <TextInput source="note" label="Ghi chú" multiline disabled={fullyLocked} fullWidth />
        </div>
      </div>
    </>
  );
}

