import { Inject, Injectable } from "@nestjs/common";
import {
  WAREHOUSE_REPOSITORY,
  WarehouseRepositoryPort,
} from "../../domain/warehouse.repository";

@Injectable()
export class AddToWarehouseUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly repository: WarehouseRepositoryPort
  ) {}

  execute(profileId: number, batchId: string): Promise<void> {
    return this.repository.addToWarehouseForProfile(profileId, batchId);
  }
}

