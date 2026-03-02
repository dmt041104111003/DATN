import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  MintBatchParams,
  ProductRepositoryPort,
} from "../../domain/product.repository";
import { mergeDbMeta } from "../../product.helpers";
import { WarehouseService } from "../../../warehouse/warehouse.service";

@Injectable()
export class RecordProductTxUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepositoryPort,
    private readonly warehouse: WarehouseService
  ) {}

  async execute(params: {
    action: "MINT" | "UPDATE" | "REVOKE" | "BURN";
    txHash: string;
    assetName: string;
    profileId: number;
    name?: string;
    description?: string;
    image?: string;
    standard?: string;
    properties?: object;
    metadata?: object;
    policyId?: string;
    receivers?: string[];
  }): Promise<void> {
    const { action, txHash, assetName, profileId } = params;

    if (action === "MINT") {
      const name = params.name ?? "";
      const description = params.description ?? "";
      const image = params.image ?? "";
      const properties = params.properties != null ? params.properties : {};
      const metadata =
        params.metadata != null && typeof params.metadata === "object"
          ? params.metadata
          : {
              name,
              description,
              image,
              standard: params.standard ?? "Traceability-v1",
            };

      const mintParams: MintBatchParams = {
        code: assetName,
        name,
        description: description || null,
        image: image || null,
        standard: params.standard ?? "Traceability-v1",
        properties,
        metadata,
        mintTxHash: txHash,
        policyId: params.policyId,
        minterProfileId: profileId,
      };

      await this.repository.upsertBatchOnMint(mintParams);

      const receivers = params.receivers ?? [];
      if (receivers.length > 0) {
        await this.repository.createRoadmaps(
          assetName,
          "MINT",
          receivers,
          txHash
        );
      }

      await this.warehouse.addToWarehouse(profileId, assetName);
      return;
    }

    const batch = await this.repository.findBatchByCode(assetName);
    if (!batch) {
      throw new BadRequestException(`Batch not found: ${assetName}`);
    }

    if (action === "UPDATE") {
      const updatePatch = {
        lastUpdateTxHash: txHash,
        lastUpdateAt: new Date().toISOString(),
      };
      const nextMetadata =
        params.metadata && typeof params.metadata === "object"
          ? mergeDbMeta(batch.metadata, {
              ...params.metadata,
              ...updatePatch,
            })
          : mergeDbMeta(batch.metadata, updatePatch);
      const nextProperties =
        params.properties != null
          ? params.properties
          : ((batch.properties as object) ?? {});
      const nextDescription =
        params.description !== undefined
          ? params.description
          : (batch.description as string | null);

      await this.repository.updateBatch({
        code: assetName,
        name: params.name ?? batch.name,
        description: nextDescription,
        image: params.image ?? batch.image,
        standard: params.standard ?? batch.standard,
        properties: nextProperties,
        metadata: nextMetadata,
      });

      const receivers = params.receivers ?? [];
      if (receivers.length > 0) {
        await this.repository.createRoadmaps(
          assetName,
          "UPDATE",
          receivers,
          txHash
        );
      }
      return;
    }

    if (action === "REVOKE") {
      const nextMetadata = mergeDbMeta(batch.metadata, {
        revokeTxHash: txHash,
        revokedAt: new Date().toISOString(),
        revoked: true,
      });
      await this.repository.markBatchRevoked(assetName, nextMetadata);

      const receivers = params.receivers ?? [];
      if (receivers.length > 0) {
        await this.repository.createRoadmaps(
          assetName,
          "REVOKE",
          receivers,
          txHash
        );
      }
      return;
    }

    if (action === "BURN") {
      const nextMetadata = mergeDbMeta(batch.metadata, {
        burnTxHash: txHash,
        burnedAt: new Date().toISOString(),
        burned: true,
      });
      await this.repository.markBatchBurned(assetName, nextMetadata);
      await this.warehouse.markAsBurned(profileId, assetName);
      return;
    }
  }
}

