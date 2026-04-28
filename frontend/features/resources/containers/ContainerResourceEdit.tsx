"use client";

import { Edit, SimpleForm } from "react-admin";
import { EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { fetchCapacitySummary } from "./fetchCapacitySummary";
import { buildParticipantPayload, ContainerFormSections, parseParticipantRows } from "./ContainerFormSections";
import { ContainerEditToolbar } from "./ContainerToolbar";

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
        const summary = await fetchCapacitySummary(
          String(data?.productionInventoryKey || "").trim(),
          String(data?.inventoryKey || "").trim(),
        );
        if (actual > Number(summary?.remainingCapacityKg || 0)) {
          throw new Error(
            `Dung lượng thực tế vượt mức còn lại của vụ mùa. Còn lại: ${summary?.remainingCapacityKg || 0} kg.`,
          );
        }
        const hasParticipantRows = Array.isArray(data?.participantRows) && data.participantRows.length > 0;
        const participants = hasParticipantRows ? buildParticipantPayload(data?.participantRows) : null;
        if (!participants) return { ...data };
        return {
          ...data,
          participantWalletAddresses: participants.participantWalletAddresses,
          participantLocationLabels: participants.participantLocationLabels,
          participantRows: participants.participantRows,
        };
      }}
    >
      <SimpleForm sx={FORM_SX} defaultValues={parseParticipantRows} toolbar={<ContainerEditToolbar />}>
        <ContainerFormSections />
      </SimpleForm>
    </Edit>
  );
}

