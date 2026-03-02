import { Inject, Injectable } from "@nestjs/common";
import {
  WAREHOUSE_REPOSITORY,
  WarehouseInventoryItem,
  WarehouseRepositoryPort,
} from "../../domain/warehouse.repository";

@Injectable()
export class ListMyInventoryUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly repository: WarehouseRepositoryPort
  ) {}

  execute(profileId: number): Promise<WarehouseInventoryItem[]> {
    return this.repository.listInventoryByProfileId(profileId);
  }
}

