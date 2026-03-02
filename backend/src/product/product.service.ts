import type { UTxO } from "@meshsdk/core";
import { deserializeAddress, resolvePaymentKeyHash } from "@meshsdk/core";
import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { CardanoService } from "../core/cardano/cardano.service";
import { WarehouseService } from "../warehouse/warehouse.service";
import { Cip68Contract } from "../core/cardano/cip68/cip68.contract";
import { createReadOnlyWallet, buildMetadata } from "./product.helpers";
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from "./domain/product.repository";
import { ListBatchesUseCase } from "./application/use-cases/list-batches.use-case";
import { RecordProductTxUseCase } from "./application/use-cases/record-product-tx.use-case";

export type { BuildMetadataInput } from "./product.helpers";

@Injectable()
export class ProductService {
  constructor(
    private readonly cardano: CardanoService,
    private readonly warehouse: WarehouseService,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    private readonly listBatchesUseCase: ListBatchesUseCase,
    private readonly recordProductTxUseCase: RecordProductTxUseCase
  ) {}

  private createContract(
    changeAddress: string,
    opts?: { walletUtxos?: UTxO[]; utxoAddresses?: string[] },
  ): Cip68Contract {
    const wallet = createReadOnlyWallet(
      changeAddress,
      this.cardano.blockfrostProvider,
      opts?.walletUtxos,
      opts?.utxoAddresses,
    );
    return new Cip68Contract({ wallet: wallet as unknown as import("@meshsdk/core").MeshWallet });
  }

  async listBatches(profileId: number): Promise<
    { id: number; code: string; name: string; image: string | null; createdAt: Date; policyId: string | null }[]
  > {
    return this.listBatchesUseCase.execute(profileId);
  }

  async mint(params: {
    changeAddress: string;
    assetName: string;
    metadata?: Record<string, string>;
    receiver?: string;
    name?: string;
    image?: string;
    receivers?: string[];
    receiverLocations?: string;
    receiverCoordinates?: string;
    minterLocation?: string;
    minterCoordinates?: string;
    propertiesJson?: string;
    walletUtxos?: UTxO[];
    utxoAddresses?: string[];
  }): Promise<{ unsignedTx: string; policyId?: string }> {
    const contract = this.createContract(params.changeAddress, {
      walletUtxos: params.walletUtxos,
      utxoAddresses: params.utxoAddresses,
    });
    let metadata: Record<string, string>;
    let receiver: string;
    if (params.metadata) {
      metadata = params.metadata;
      receiver = params.receiver ?? params.changeAddress;
    } else {
      if (
        !params.name ||
        !params.image ||
        !params.receivers?.length ||
        !params.receiverLocations ||
        !params.receiverCoordinates ||
        !params.minterLocation ||
        !params.minterCoordinates
      ) {
        throw new BadRequestException(
          "Need metadata or all of (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)",
        );
      }
      const addrObj = deserializeAddress(params.changeAddress);
      const receiversPk = params.receivers.map((addr) => resolvePaymentKeyHash(addr)).join(",");
      metadata = buildMetadata({
        pk: addrObj.pubKeyHash,
        receivers: receiversPk,
        receiver_locations: params.receiverLocations,
        receiver_coordinates: params.receiverCoordinates,
        minter_location: params.minterLocation,
        minter_coordinates: params.minterCoordinates,
        name: params.name,
        image: params.image,
        properties: params.propertiesJson,
        standard: "Traceability-v1",
      });
      receiver = params.changeAddress;
    }
    const unsignedTx = await contract.mint([
      { assetName: params.assetName, metadata, quantity: "1", receiver },
    ]);
    const policyId = (contract as { policyId?: string }).policyId ?? undefined;
    return { unsignedTx, policyId };
  }

  async update(params: {
    changeAddress: string;
    assetName: string;
    txHash?: string;
    metadata?: Record<string, string>;
    name?: string;
    image?: string;
    receivers?: string[];
    receiverLocations?: string;
    receiverCoordinates?: string;
    minterLocation?: string;
    minterCoordinates?: string;
    propertiesJson?: string;
    certUnit?: string;
    walletUtxos?: UTxO[];
    utxoAddresses?: string[];
  }): Promise<{ unsignedTx: string }> {
    const contract = this.createContract(params.changeAddress, {
      walletUtxos: params.walletUtxos,
      utxoAddresses: params.utxoAddresses,
    });
    let metadata: Record<string, string>;
    if (params.metadata) {
      metadata = { ...params.metadata };
      if (params.certUnit != null && params.certUnit.trim() !== "") {
        metadata._cert_unit = params.certUnit.trim();
      }
    } else {
      if (
        !params.name ||
        !params.image ||
        !params.receivers?.length ||
        !params.receiverLocations ||
        !params.receiverCoordinates ||
        !params.minterLocation ||
        !params.minterCoordinates
      ) {
        throw new BadRequestException(
          "Need metadata or all of (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)",
        );
      }
      const addrObj = deserializeAddress(params.changeAddress);
      const receiversPk = params.receivers.map((addr) => resolvePaymentKeyHash(addr)).join(",");
      metadata = buildMetadata({
        pk: addrObj.pubKeyHash,
        receivers: receiversPk,
        receiver_locations: params.receiverLocations,
        receiver_coordinates: params.receiverCoordinates,
        minter_location: params.minterLocation,
        minter_coordinates: params.minterCoordinates,
        name: params.name,
        image: params.image,
        properties: params.propertiesJson,
        standard: "Traceability-v1",
      });
    }
    const unsignedTx = await contract.update([
      { assetName: params.assetName, metadata, txHash: params.txHash },
    ]);
    return { unsignedTx };
  }

  async revoke(params: {
    changeAddress: string;
    assetName: string;
    txHash?: string;
    walletUtxos?: UTxO[];
    utxoAddresses?: string[];
  }): Promise<{ unsignedTx: string }> {
    const contract = this.createContract(params.changeAddress, {
      walletUtxos: params.walletUtxos,
      utxoAddresses: params.utxoAddresses,
    });
    const unsignedTx = await contract.revoke([
      { assetName: params.assetName, txHash: params.txHash },
    ]);
    return { unsignedTx };
  }

  async burn(params: {
    changeAddress: string;
    assetName: string;
    txHash?: string;
    policyId?: string;
    walletUtxos?: UTxO[];
    utxoAddresses?: string[];
  }): Promise<{ unsignedTx: string }> {
    const contract = this.createContract(params.changeAddress, {
      walletUtxos: params.walletUtxos,
      utxoAddresses: params.utxoAddresses,
    });
    const balance = await contract.getRftBalanceAtAddress(
      params.changeAddress,
      params.assetName,
      params.policyId,
    );
    if (balance < 1) {
      throw new BadRequestException(
        "Wallet does not hold this NFT. Burn is only allowed if the wallet has the NFT.",
      );
    }
    const unsignedTx = await contract.burn([
      {
        assetName: params.assetName,
        quantity: "1",
        txHash: params.txHash,
      },
    ]);
    return { unsignedTx };
  }

  async recordTx(params: {
    action: "MINT" | "UPDATE" | "REVOKE" | "BURN";
    txHash: string;
    assetName: string;
    profileId: number;
    name?: string;
    image?: string;
    standard?: string;
    properties?: object;
    metadata?: object;
    policyId?: string;
    receivers?: string[];
  }): Promise<void> {
    return this.recordProductTxUseCase.execute(params);
  }

  async removeOneFromWarehouse(profileId: number, batchId: string): Promise<void> {
    return this.warehouse.removeOneFromWarehouse(profileId, batchId);
  }

  async addToWarehouse(profileId: number, batchId: string): Promise<void> {
    return this.warehouse.addToWarehouse(profileId, batchId);
  }

  async submitSignedTx(signedTxInput: string, fromBase64 = false): Promise<{ txHash: string }> {
    let cborBuffer: Buffer;
    if (fromBase64) {
      try {
        cborBuffer = Buffer.from(signedTxInput, "base64");
      } catch {
        throw new BadRequestException("signedTxBase64 is invalid");
      }
    } else {
      let signedTxHex: string;
      const stripped = signedTxInput.startsWith("0x") ? signedTxInput.slice(2) : signedTxInput.trim();
      let parsed: unknown = stripped;
      try {
        if (stripped.startsWith("{")) parsed = JSON.parse(stripped) as Record<string, unknown>;
      } catch {
        parsed = stripped;
      }
      const str = typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>).signedTransaction
          ?? (parsed as Record<string, unknown>).cborTx
          ?? (parsed as Record<string, unknown>).cbor
          ?? (parsed as Record<string, unknown>).tx
          ?? (parsed as Record<string, unknown>).transaction
          ?? stripped
        : stripped;
      const s = String(str);
      const isHex = /^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0;
      if (isHex) {
        signedTxHex = s;
      } else {
        try {
          const bytes = Buffer.from(s, "base64");
          signedTxHex = Buffer.from(bytes).toString("hex");
        } catch {
          throw new BadRequestException("signedTx must be hex or base64");
        }
      }
      cborBuffer = Buffer.from(signedTxHex, "hex");
    }
    const first = cborBuffer[0];
    const isCborList = first >= 0x80 && first <= 0x9f;
    const isCborListLong = first === 0x98 && cborBuffer.length > 1;
    if (!isCborList && !isCborListLong) {
      throw new BadRequestException(
        `signedTx is not valid CBOR tx (first byte 0x${first.toString(16).padStart(2, "0")}, length ${cborBuffer.length}). Wallet may return a different format.`
      );
    }
    const txHash = await this.cardano.blockfrostFetcher.submitTx(cborBuffer);
    return { txHash };
  }
}
