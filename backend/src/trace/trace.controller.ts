import { Controller, Get, Post, Body, Query, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { TraceService } from "./trace.service";
import { AuthService } from "../auth/auth.service";
import {
  MintTraceDto,
  UpdateTraceDto,
  RevokeTraceDto,
  MintConfirmDto,
  UpdateConfirmDto,
  RevokeConfirmDto,
  SubmitTxDto,
} from "./dto/trace.dto";

@Controller("trace")
export class TraceController {
  constructor(
    private readonly trace: TraceService,
    private readonly auth: AuthService,
  ) {}

  @Get("batches")
  async listBatches(
    @Query("token") token?: string,
  ): Promise<{
    total: number;
    items: { id: string; name: string; image: string | null; createdAt: Date }[];
  }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const items = await this.trace.listBatches(profileId);
    return { total: items.length, items };
  }

  @Post("mint")
  async mint(
    @Body() body: MintTraceDto,
  ): Promise<{ unsignedTx: string }> {
    if (!body.changeAddress || !body.assetName) {
      throw new BadRequestException("Thiếu changeAddress hoặc assetName");
    }
    if (!body.metadata && (
      !body.name ||
      !body.image ||
      !body.receivers?.length ||
      !body.receiverLocations ||
      !body.receiverCoordinates ||
      !body.minterLocation ||
      !body.minterCoordinates
    )) {
      throw new BadRequestException(
        "Thiếu metadata hoặc (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)",
      );
    }
    return this.trace.mint({
      changeAddress: body.changeAddress,
      assetName: body.assetName,
      metadata: body.metadata,
      receiver: body.receiver,
      name: body.name,
      image: body.image,
      receivers: body.receivers,
      receiverLocations: body.receiverLocations,
      receiverCoordinates: body.receiverCoordinates,
      minterLocation: body.minterLocation,
      minterCoordinates: body.minterCoordinates,
      propertiesJson: body.propertiesJson,
      walletUtxos: body.walletUtxos as any,
      utxoAddresses: body.utxoAddresses,
    });
  }

  @Post("update")
  async update(
    @Body() body: UpdateTraceDto,
  ): Promise<{ unsignedTx: string }> {
    if (!body.changeAddress || !body.assetName) {
      throw new BadRequestException("Thiếu changeAddress hoặc assetName");
    }
    if (!body.metadata && (
      !body.name ||
      !body.image ||
      !body.receivers?.length ||
      !body.receiverLocations ||
      !body.receiverCoordinates ||
      !body.minterLocation ||
      !body.minterCoordinates
    )) {
      throw new BadRequestException(
        "Thiếu metadata hoặc (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)",
      );
    }
    return this.trace.update({
      changeAddress: body.changeAddress,
      assetName: body.assetName,
      txHash: body.txHash,
      metadata: body.metadata,
      name: body.name,
      image: body.image,
      receivers: body.receivers,
      receiverLocations: body.receiverLocations,
      receiverCoordinates: body.receiverCoordinates,
      minterLocation: body.minterLocation,
      minterCoordinates: body.minterCoordinates,
      propertiesJson: body.propertiesJson,
      walletUtxos: body.walletUtxos as any,
      utxoAddresses: body.utxoAddresses,
    });
  }

  @Post("revoke")
  async revoke(
    @Body() body: RevokeTraceDto,
  ): Promise<{ unsignedTx: string }> {
    if (!body.changeAddress || !body.assetName) {
      throw new BadRequestException("Thiếu changeAddress hoặc assetName");
    }
    return this.trace.revoke({
      changeAddress: body.changeAddress,
      assetName: body.assetName,
      txHash: body.txHash,
      walletUtxos: body.walletUtxos as any,
      utxoAddresses: body.utxoAddresses,
    });
  }

  @Post("mint/confirm")
  async mintConfirm(
    @Body() body: MintConfirmDto,
  ): Promise<{ ok: boolean }> {
    if (!body.txHash || !body.assetName || !body.name || body.minterProfileId == null) {
      throw new BadRequestException("Thiếu txHash, assetName, name hoặc minterProfileId");
    }
    await this.trace.recordTx({
      action: "MINT",
      txHash: body.txHash,
      assetName: body.assetName,
      profileId: body.minterProfileId,
      name: body.name,
      image: body.image ?? "",
      standard: body.standard,
      properties: body.properties,
      metadata: body.metadata,
    });
    return { ok: true };
  }

  @Post("update/confirm")
  async updateConfirm(
    @Body() body: UpdateConfirmDto,
  ): Promise<{ ok: boolean }> {
    if (!body.txHash || !body.assetName || body.profileId == null) {
      throw new BadRequestException("Thiếu txHash, assetName hoặc profileId");
    }
    await this.trace.recordTx({
      action: "UPDATE",
      txHash: body.txHash,
      assetName: body.assetName,
      profileId: body.profileId,
      name: body.name,
      image: body.image,
      standard: body.standard,
      properties: body.properties,
      metadata: body.metadata,
    });
    return { ok: true };
  }

  @Post("revoke/confirm")
  async revokeConfirm(
    @Body() body: RevokeConfirmDto,
  ): Promise<{ ok: boolean }> {
    if (!body.txHash || !body.assetName || body.profileId == null) {
      throw new BadRequestException("Thiếu txHash, assetName hoặc profileId");
    }
    await this.trace.recordTx({
      action: "REVOKE",
      txHash: body.txHash,
      assetName: body.assetName,
      profileId: body.profileId,
    });
    return { ok: true };
  }

  @Post("submit")
  async submit(
    @Body() body: SubmitTxDto,
  ): Promise<{ txHash: string }> {
    const raw = body.signedTxBase64 ?? body.signedTx;
    if (!raw || typeof raw !== "string") {
      throw new BadRequestException("Thiếu signedTx hoặc signedTxBase64");
    }
    return this.trace.submitSignedTx(raw, !!body.signedTxBase64);
  }
}
