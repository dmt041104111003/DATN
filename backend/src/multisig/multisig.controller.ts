import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { MultisigService } from "./multisig.service";
import {
  BuildLockTxDto,
  BuildUnlockTxDto,
  ParseDatumDto,
  MergePartialTxDto,
} from "./dto/multisig.dto";

@Controller("multisig")
export class MultisigController {
  constructor(private readonly multisig: MultisigService) {}

  @Get("script-address")
  getScriptAddress(): { scriptAddress: string } {
    return { scriptAddress: this.multisig.getScriptAddress() };
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
}
