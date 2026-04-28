"use client";

import { Create, SimpleForm } from "react-admin";
import { CREATE_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { makeDailyCode } from "@/features/resources/shared/code";
import { fetchCapacitySummary } from "./fetchCapacitySummary";
import { buildParticipantPayload, ContainerFormSections } from "./ContainerFormSections";
import { ContainerCreateToolbar } from "./ContainerToolbar";

export function ContainerResourceCreate() {
  return (
    <Create
      transform={async (data: any) => {
        const code = String(data?.code || "").trim() || makeDailyCode("THUNG");
        const max = Number(String(data?.capacityKg || "").trim());
        const actual = Number(String(data?.actualCapacityKg || "").trim());
        if (Number.isFinite(max) && Number.isFinite(actual) && actual > max) {
          throw new Error("Dung lượng thực tế phải nhỏ hơn hoặc bằng dung lượng chứa tối đa.");
        }
        const summary = await fetchCapacitySummary(String(data?.productionInventoryKey || "").trim());
        if (actual > Number(summary?.remainingCapacityKg || 0)) {
          throw new Error(
            `Dung lượng thực tế vượt mức còn lại của vụ mùa. Còn lại: ${summary?.remainingCapacityKg || 0} kg.`,
          );
        }
        const participants = buildParticipantPayload(data?.participantRows);
        return {
          ...data,
          code,
          participantWalletAddresses: participants.participantWalletAddresses,
          participantLocationLabels: participants.participantLocationLabels,
          participantRows: participants.participantRows,
          status: "CREATE",
        };
      }}
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm sx={FORM_SX} toolbar={<ContainerCreateToolbar />} defaultValues={{ code: makeDailyCode("THUNG"), status: "CREATE" }}>
        <ContainerFormSections participantsReadOnly={false} />
      </SimpleForm>
    </Create>
  );
}

