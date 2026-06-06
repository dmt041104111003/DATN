"use client";

import { useListContext } from "react-admin";
import type { EntityVerifyType } from "./entityVerification";
import { useListVerificationPoll } from "./useListVerificationPoll";

export function ListVerificationPoll({ entityType }: { entityType: EntityVerifyType }) {
  const { data, refetch } = useListContext();
  useListVerificationPoll(entityType, data, refetch);
  return null;
}
