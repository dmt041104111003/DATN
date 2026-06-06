"use client";

import * as React from "react";
import { Create, SimpleForm, useNotify, useRedirect } from "react-admin";
import { CREATE_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { EMPTY_PARTICIPANT_ROW } from "@/features/resources/shared/locationHelpers";
import { buildParticipantPayload, ContainerFormSections } from "./ContainerFormSections";
import { ContainerCreateToolbar } from "./ContainerToolbar";
import { createContainerBatchOnchain } from "@/features/core/onchain/module/create/containerBatch";
import { getOnchainFlowDeps } from "@/features/core/onchain/getOnchainFlowDeps";

export function ContainerResourceCreate() {
  const notify = useNotify();
  const redirect = useRedirect();
  const [progress, setProgress] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (data: any) => {
    if (submitting) return;
    setSubmitting(true);
    setProgress("Đang bắt đầu tạo thùng hàng...");
    try {
      const participants = buildParticipantPayload(data?.participantRows);
      const payload = {
        ...data,
        participantWalletAddresses: participants.participantWalletAddresses,
        participantLocationLabels: participants.participantLocationLabels,
        participantRows: participants.participantRows,
        status: "CREATE",
      };
      const result = await createContainerBatchOnchain(
        { data: payload },
        getOnchainFlowDeps(),
        setProgress,
      );
      const created = Number((result.data as any)?.batchCreated || 0);
      notify(created > 1 ? `Đã tạo ${created} thùng hàng.` : "Đã tạo thùng hàng.", { type: "success" });
      redirect("list", "container");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Tạo thùng hàng thất bại.", { type: "error" });
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  };

  return (
    <Create sx={CREATE_PAGE_SX} redirect={false}>
      <SimpleForm
        sx={MIL_FORM_SX}
        toolbar={<ContainerCreateToolbar progress={progress} submitting={submitting} />}
        defaultValues={{ boxQuantity: 1, status: "CREATE", participantRows: [{ ...EMPTY_PARTICIPANT_ROW }] }}
        onSubmit={handleSubmit}
      >
        <ContainerFormSections participantsReadOnly={false} showBoxQuantity />
      </SimpleForm>
    </Create>
  );
}
