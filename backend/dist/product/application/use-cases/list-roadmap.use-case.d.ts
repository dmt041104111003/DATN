import { ProductRepositoryPort, ProductRoadmapHop } from "../../domain/product.repository";
export declare class ListRoadmapUseCase {
    private readonly repository;
    constructor(repository: ProductRepositoryPort);
    execute(batchId: string): Promise<ProductRoadmapHop[]>;
}
