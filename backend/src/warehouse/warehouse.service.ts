import { Inject, Injectable } from "@nestjs/common";
import {
  WAREHOUSE_REPOSITORY,
  WarehouseInventoryItem,
  WarehouseRepositoryPort,
} from "./domain/warehouse.repository";
import { ListMyInventoryUseCase } from "./application/use-cases/list-my-inventory.use-case";
import { RemoveItemUseCase } from "./application/use-cases/remove-item.use-case";
import { MarkShippedUseCase } from "./application/use-cases/mark-shipped.use-case";
import { MarkBurnedUseCase } from "./application/use-cases/mark-burned.use-case";
import { AddToWarehouseUseCase } from "./application/use-cases/add-to-warehouse.use-case";
import { GetRecipientByRoadmapUseCase } from "./application/use-cases/get-recipient-by-roadmap.use-case";

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly repository: WarehouseRepositoryPort,
    private readonly listMyInventoryUseCase: ListMyInventoryUseCase,
    private readonly removeItemUseCase: RemoveItemUseCase,
    private readonly markShippedUseCase: MarkShippedUseCase,
    private readonly markBurnedUseCase: MarkBurnedUseCase,
    private readonly addToWarehouseUseCase: AddToWarehouseUseCase,
    private readonly getRecipientByRoadmapUseCase: GetRecipientByRoadmapUseCase
  ) {}

  async listMyWarehouseInventory(profileId: number): Promise<
    WarehouseInventoryItem[]
  > {
    return this.listMyInventoryUseCase.execute(profileId);
  }

  async removeOneFromWarehouse(profileId: number, batchId: string): Promise<void> {
    return this.removeItemUseCase.execute(profileId, batchId);
  }

  async markAsShipped(profileId: number, batchId: string): Promise<void> {
    return this.markShippedUseCase.execute(profileId, batchId);
  }

  async markAsBurned(profileId: number, batchId: string): Promise<void> {
    return this.markBurnedUseCase.execute(profileId, batchId);
  }

  async addToWarehouse(profileId: number, batchId: string): Promise<void> {
    return this.addToWarehouseUseCase.execute(profileId, batchId);
  }

  async getRecipientByRoadmap(profileId: number, batchId: string): Promise<{ recipientAddress: string | null }> {
    return this.getRecipientByRoadmapUseCase.execute(profileId, batchId);
  }
}
