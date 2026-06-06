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
import { normalizeEvidenceFilesForForm } from "@/features/resources/shared/evidenceFiles";
import { MilGrid, MilSection } from "@/features/ui/military/MilSection";
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
  const watchedEvidenceFiles = useWatch({ name: "evidenceFiles" });
  const evidencePreviews = normalizeEvidenceFilesForForm(watchedEvidenceFiles);
  const hasOtherCertification = certifications.includes("other");
  const fullyLocked = status === "CLOSED";
  const lockedCore = fullyLocked;

  return (
    <>
      {fullyLocked ? <span className="mil-badge">Đã thu hoạch</span> : null}

      <MilSection index={1} title="Thông tin vụ sản xuất">
        <MilGrid>
          <TextInput source="code" label="Mã vụ mùa" disabled fullWidth />
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
          {evidencePreviews.length > 0 ? (
            <div className="md:col-span-2 flex flex-wrap gap-3">
              {evidencePreviews.map((file) => (
                <a
                  key={file.src}
                  href={file.src}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded border border-neutral-300"
                >
                  <img
                    src={file.src}
                    alt={file.title}
                    className="h-28 w-28 object-cover"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          ) : null}
          <div className="md:col-span-2">
            <FileInput
              source="evidenceFiles"
              label="Ảnh minh chứng (nhiều ảnh)"
              multiple
              disabled={fullyLocked}
            >
              <FileField source="src" title="title" />
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
