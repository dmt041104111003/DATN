import { OrderRepositoryPort, OrderSummary } from "../../domain/order.repository";
export declare class ListOrdersForProfileUseCase {
    private readonly repository;
    constructor(repository: OrderRepositoryPort);
    execute(profileId: number): Promise<OrderSummary[]>;
}
