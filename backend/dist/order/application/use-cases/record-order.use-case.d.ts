import { OrderRecordParams, OrderRepositoryPort } from "../../domain/order.repository";
export declare class RecordOrderUseCase {
    private readonly repository;
    constructor(repository: OrderRepositoryPort);
    execute(params: OrderRecordParams): Promise<{
        id: number;
    }>;
}
