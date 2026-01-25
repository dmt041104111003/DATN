export const SUBSCRIPTION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type SubscriptionStatus =
  | typeof SUBSCRIPTION_STATUS.PENDING
  | typeof SUBSCRIPTION_STATUS.ACTIVE
  | typeof SUBSCRIPTION_STATUS.EXPIRED
  | typeof SUBSCRIPTION_STATUS.CANCELLED;
