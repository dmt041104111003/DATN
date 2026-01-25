export declare const SUBSCRIPTION_STATUS: {
    readonly PENDING: "pending";
    readonly ACTIVE: "active";
    readonly EXPIRED: "expired";
    readonly CANCELLED: "cancelled";
};
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS.PENDING | typeof SUBSCRIPTION_STATUS.ACTIVE | typeof SUBSCRIPTION_STATUS.EXPIRED | typeof SUBSCRIPTION_STATUS.CANCELLED;
