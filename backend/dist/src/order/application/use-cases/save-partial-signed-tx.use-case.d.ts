import { OrderRepositoryPort } from "../../domain/order.repository";
export declare class SavePartialSignedTxUseCase {
    private readonly repository;
    constructor(repository: OrderRepositoryPort);
    execute(deliveryId: number, profileId: number, partialTxHex: string): Promise<{
        ok: boolean;
    }>;
}
