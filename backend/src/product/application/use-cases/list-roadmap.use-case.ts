import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
  ProductRoadmapHop,
} from "../../domain/product.repository";

@Injectable()
export class ListRoadmapUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepositoryPort
  ) {}

  execute(batchCode: string): Promise<ProductRoadmapHop[]> {
    return this.repository.listRoadmap(batchCode);
  }
}

