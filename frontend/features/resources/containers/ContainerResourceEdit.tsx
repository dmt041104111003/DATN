"use client";

import { Edit, SimpleForm } from "react-admin";
import { EDIT_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { useEntityVerificationPoll } from "@/features/resources/shared/useEntityVerificationPoll";
import { buildParticipantPayload, ContainerFormSections, parseParticipantRows } from "./ContainerFormSections";
import { ContainerEditToolbar } from "./ContainerToolbar";

function ContainerVerificationPoll() {
  useEntityVerificationPoll("CONTAINER");
  return null;
}

export function ContainerResourceEdit() {
  return (
    <Edit
      mutationMode="pessimistic"
      sx={EDIT_PAGE_SX}
      transform={async (data: any) => {
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
      <SimpleForm sx={MIL_FORM_SX} defaultValues={parseParticipantRows} toolbar={<ContainerEditToolbar />}>
        <ContainerVerificationPoll />
        <ContainerFormSections />
      </SimpleForm>
    </Edit>
  );
}

