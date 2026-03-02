import { RoadmapHop, WarehouseRepositoryPort } from "../../domain/warehouse.repository";
export declare class ListRoadmapUseCase {
    private readonly repository;
    constructor(repository: WarehouseRepositoryPort);
    execute(batchId: string): Promise<RoadmapHop[]>;
}
