import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  ProductBatchListItem,
  ProductRepositoryPort,
} from "../../domain/product.repository";

@Injectable()
export class ListBatchesUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepositoryPort
  ) {}

  execute(profileId: number): Promise<ProductBatchListItem[]> {
    return this.repository.listBatchesByMinter(profileId);
  }
}

