import { Inject, Injectable } from "@nestjs/common";
import {
  RecipientByRoadmapResult,
  WAREHOUSE_REPOSITORY,
  WarehouseRepositoryPort,
} from "../../domain/warehouse.repository";

@Injectable()
export class GetRecipientByRoadmapUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly repository: WarehouseRepositoryPort
  ) {}

  execute(
    profileId: number,
    batchId: string
  ): Promise<RecipientByRoadmapResult> {
    return this.repository.findRecipientByRoadmap(profileId, batchId);
  }
}

