export declare class CreatePaymentDto {
    userId: string;
    subscriptionId: string;
    amount: number;
    currency?: string;
    txHash: string;
    paymentDate: string;
}
