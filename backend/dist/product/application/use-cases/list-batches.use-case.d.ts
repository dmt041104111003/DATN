import { ProductBatchListItem, ProductRepositoryPort } from "../../domain/product.repository";
export declare class ListBatchesUseCase {
    private readonly repository;
    constructor(repository: ProductRepositoryPort);
    execute(profileId: number): Promise<ProductBatchListItem[]>;
}
