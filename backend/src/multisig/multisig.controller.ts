import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { MultisigService } from "./multisig.service";
import { AuthService } from "../auth/auth.service";
import {
  BuildLockTxDto,
  BuildUnlockTxDto,
  ParseDatumDto,
  MergePartialTxDto,
  LockConfirmDto,
  UnlockConfirmDto,
  SavePartialTxDto,
} from "./dto/multisig.dto";

@Controller("multisig")
export class MultisigController {
  constructor(
    private readonly multisig: MultisigService,
    private readonly auth: AuthService,
  ) {}

  @Get("script-address")
  getScriptAddress(): { scriptAddress: string } {
    return { scriptAddress: this.multisig.getScriptAddress() };
  }

  @Get("lock-deliveries")
  async getLockDeliveries(
    @Query("token") token?: string,
  ): Promise<{
    deliveries: {
      id: number;
      lockTxHash: string;
      scriptOutputIndex: number;
      batchId: string;
      policyId: string | null;
      recipientAddress: string;
      senderAddress: string;
      ownerAddresses: string[];
      status: string;
      partialSignedTxHex: string | null;
      partialSignedByAddress: string | null;
      secondSignedByAddress: string | null;
      unlockTxHash: string | null;
    }[];
  }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const deliveries = await this.multisig.listLockDeliveriesForProfile(profileId);
    return { deliveries };
  }

  @Post("lock-deliveries/:id/save-partial-tx")
  async savePartialTx(
    @Param("id") id: string,
    @Query("token") token: string | undefined,
    @Body() body: SavePartialTxDto,
  ): Promise<{ ok: boolean }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const deliveryId = Number(id);
    if (!Number.isInteger(deliveryId) || deliveryId < 1) {
      throw new BadRequestException("Invalid delivery id.");
    }
    if (!body.partialTxHex?.trim()) {
      throw new BadRequestException("Missing partialTxHex.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    return this.multisig.savePartialSignedTx(deliveryId, profileId, body.partialTxHex.trim());
  }

  @Get("script-utxos")
  async getScriptUtxos(
    @Query("scriptAddress") scriptAddress?: string,
  ): Promise<{ utxos: unknown[] }> {
    const utxos = await this.multisig.getScriptUtxos(scriptAddress);
    return { utxos };
  }

  @Get("script-utxo-by-asset")
  async getScriptUtxoByAsset(
    @Query("policyId") policyId?: string,
    @Query("assetName") assetName?: string,
    @Query("scriptAddress") scriptAddress?: string,
  ): Promise<{ utxo: unknown | null }> {
    if (!policyId?.trim() || !assetName?.trim()) {
      throw new BadRequestException("Missing policyId or assetName");
    }
    const utxo = await this.multisig.getScriptUtxoByAsset(
      policyId.trim(),
      assetName.trim(),
      scriptAddress?.trim() || undefined,
    );
    return { utxo };
  }

  @Post("build-lock-tx")
  async buildLockTx(
    @Body() body: BuildLockTxDto,
  ): Promise<{ unsignedTx: string; scriptAddress: string }> {
    if (
      !body.scriptAddress ||
      !body.ownersPkh?.length ||
      body.threshold == null ||
      !body.recipientPkh ||
      !body.assets?.length ||
      !body.changeAddress ||
      !body.utxos?.length
    ) {
      throw new BadRequestException(
        "Missing scriptAddress, ownersPkh, threshold, recipientPkh, assets, changeAddress or utxos",
      );
    }
    const unsignedTx = await this.multisig.buildLockTx({
      scriptAddress: body.scriptAddress,
      ownersPkh: body.ownersPkh,
      threshold: body.threshold,
      recipientPkh: body.recipientPkh,
      assets: body.assets,
      changeAddress: body.changeAddress,
      utxos: body.utxos,
    });
    return {
      unsignedTx,
      scriptAddress: body.scriptAddress,
    };
  }

  @Post("parse-datum")
  async parseDatum(
    @Body() body: ParseDatumDto,
  ): Promise<{
    ownersPkh: string[];
    threshold: number;
    recipientPkh: string;
    recipientAddress: string;
    ownerAddresses: string[];
  }> {
    if (!body.scriptUtxo?.input || !body.scriptUtxo?.output) {
      throw new BadRequestException("Missing scriptUtxo (input + output)");
    }
    return this.multisig.parseDatumFromUtxo(body.scriptUtxo);
  }

  @Post("build-unlock-tx")
  async buildUnlockTx(
    @Body() body: BuildUnlockTxDto,
  ): Promise<{ unsignedTx: string }> {
    if (
      !body.scriptUtxo?.input ||
      !body.scriptUtxo?.output ||
      !body.outputAddress ||
      !body.signingOwnersPkh?.length ||
      body.threshold == null ||
      !body.collateral?.input ||
      !body.changeAddress ||
      !body.utxos
    ) {
      throw new BadRequestException(
        "Missing scriptUtxo, outputAddress, signingOwnersPkh, threshold, collateral, changeAddress or utxos",
      );
    }
    if (body.signingOwnersPkh.length < body.threshold) {
      throw new BadRequestException(
        `signingOwnersPkh.length (${body.signingOwnersPkh.length}) < threshold (${body.threshold})`,
      );
    }
    const unsignedTx = await this.multisig.buildUnlockTx({
      scriptUtxo: body.scriptUtxo,
      outputAddress: body.outputAddress,
      signingOwnersPkh: body.signingOwnersPkh,
      threshold: body.threshold,
      collateral: body.collateral,
      changeAddress: body.changeAddress,
      utxos: body.utxos,
    });
    return { unsignedTx };
  }

  @Post("merge-partial-tx")
  mergePartialTx(
    @Body() body: MergePartialTxDto,
  ): { mergedTxHex: string; witnessCount: number; requiredSigners: string[] } {
    if (!body.partialTxHex || !body.secondSignerResultHex) {
      throw new BadRequestException(
        "Missing partialTxHex or secondSignerResultHex",
      );
    }
    return this.multisig.mergePartialTx(
      body.partialTxHex,
      body.secondSignerResultHex,
    );
  }

  @Get("inspect-tx")
  inspectTx(
    @Query("txHex") txHex?: string,
  ): { requiredSigners: string[]; witnessCount: number } {
    if (!txHex?.trim()) {
      throw new BadRequestException("Missing query txHex");
    }
    return this.multisig.inspectTx(txHex);
  }

  @Post("lock/confirm")
  async lockConfirm(
    @Body() body: LockConfirmDto,
  ): Promise<{ id: number }> {
    if (!body.lockTxHash?.trim() || !body.batchId?.trim() || !body.recipientAddress?.trim()) {
      throw new BadRequestException("Missing lockTxHash, batchId or recipientAddress");
    }
    if (!body.senderAddress?.trim()) {
      throw new BadRequestException("Missing senderAddress (người gửi)");
    }
    if (!Array.isArray(body.ownerAddresses)) {
      throw new BadRequestException("ownerAddresses must be an array (danh sách owner)");
    }
    return this.multisig.recordLockDelivery({
      lockTxHash: body.lockTxHash,
      scriptOutputIndex: body.scriptOutputIndex ?? 0,
      batchId: body.batchId,
      policyId: body.policyId,
      recipientAddress: body.recipientAddress,
      senderAddress: body.senderAddress,
      ownerAddresses: body.ownerAddresses,
    });
  }

  @Post("unlock/confirm")
  async unlockConfirm(
    @Body() body: UnlockConfirmDto,
  ): Promise<{ ok: boolean; recipientAddress?: string }> {
    if (!body.unlockTxHash?.trim()) {
      throw new BadRequestException("Missing unlockTxHash");
    }
    if (typeof body.witnessCount !== "number" || body.witnessCount < 2) {
      throw new BadRequestException("witnessCount is required and must be >= 2 (đủ 2 chữ ký)");
    }
    return this.multisig.confirmUnlockDelivery({
      unlockTxHash: body.unlockTxHash,
      witnessCount: body.witnessCount,
      signedByAddress: body.signedByAddress?.trim() || undefined,
      deliveryId: body.deliveryId,
    });
  }
}
