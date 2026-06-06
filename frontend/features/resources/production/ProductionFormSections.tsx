"use client";

import {
  CheckboxGroupInput,
  DateInput,
  FileField,
  FileInput,
  maxValue,
  required,
  SelectInput,
  TextInput,
  useRecordContext,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { EvidenceImage } from "@/features/resources/shared/EvidenceImage";
import { normalizeEvidenceFilesForForm } from "@/features/resources/shared/evidenceFiles";
import { MilGrid, MilSection } from "@/features/ui/military/MilSection";
import {
  datePickerBounds,
  seedingDateBounds,
  todayDateInputValue,
} from "@/features/resources/shared/dateInputBounds";
import { positiveNumber } from "@/features/resources/shared/numberHelpers";
import { CERTIFICATIONS } from "./constants";
import { ProductionAdministrativeAreaFields } from "./ProductionAdministrativeAreaFields";
import { ProductionFacilityAutofill } from "./ProductionFacilityAutofill";

export function ProductionFormSections() {
  const record = useRecordContext();
  const watchedStatus = useWatch({ name: "status" });
  const watchedVarietyId = useWatch({ name: "varietyId" });
  const watchedCertifications = useWatch({ name: "certifications" });
  const status = String(watchedStatus ?? "CREATED");
  const varietyId = String(watchedVarietyId ?? "");
  const certifications = Array.isArray(watchedCertifications) ? watchedCertifications : [];
  const savedEvidence = normalizeEvidenceFilesForForm(
    record?.evidenceFiles ?? record?.images,
  );
  const hasOtherCertification = certifications.includes("other");
  const fullyLocked = status === "CLOSED";
  const lockedCore = fullyLocked;
  const seedingMax = todayDateInputValue();
  const seedingDateProps = datePickerBounds(seedingDateBounds());

  return (
    <>
      <ProductionFacilityAutofill />
      {fullyLocked ? <span className="mil-badge">Đã thu hoạch</span> : null}

      <MilSection index={1} title="Thông tin vụ sản xuất">
        <MilGrid>
          <TextInput source="code" label="Mã vụ mùa" disabled fullWidth />
          <TextInput
            source="facilityId"
            label="Tên cơ sở sản xuất"
            disabled
            validate={[required()]}
            fullWidth
            helperText="Tự lấy từ tên hiển thị trong hồ sơ"
          />
          <div className="md:col-span-2 text-sm text-neutral-600 -mt-1 mb-1">
            Địa chỉ tự lấy từ vị trí kho trong hồ sơ
          </div>
          <ProductionAdministrativeAreaFields />
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
            validate={[required(), maxValue(seedingMax, "Không chọn ngày tương lai")]}
            fullWidth
            {...seedingDateProps}
          />
          {fullyLocked ? (
            <DateInput source="harvestDate" label="Ngày thu hoạch" disabled fullWidth />
          ) : null}
        </MilGrid>
      </MilSection>

      <MilSection index={2} title="Thông tin cây trồng">
        <MilGrid>
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
        </MilGrid>
      </MilSection>

      <MilSection index={3} title="Chứng nhận & minh chứng">
        <MilGrid>
          <div id="production-cert-section" className="md:col-span-2">
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
          {savedEvidence.length > 0 ? (
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-neutral-700">Ảnh đã lưu</p>
              <div className="flex flex-wrap gap-3">
                {savedEvidence.map((file) => (
                  <a
                    key={file.src}
                    href={file.src}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded border border-neutral-300"
                  >
                    <EvidenceImage
                      uri={file.uri}
                      alt={file.title}
                      className="h-28 w-28 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          <div className="md:col-span-2">
            <FileInput
              source="newEvidenceFiles"
              label={savedEvidence.length > 0 ? "Thêm ảnh minh chứng" : "Ảnh minh chứng (nhiều ảnh)"}
              multiple
              disabled={fullyLocked}
            >
              <FileField source="title" title="title" />
            </FileInput>
          </div>
          <div className="md:col-span-2">
            <TextInput source="note" label="Ghi chú" multiline disabled={fullyLocked} fullWidth />
          </div>
        </MilGrid>
      </MilSection>
    </>
  );
}
