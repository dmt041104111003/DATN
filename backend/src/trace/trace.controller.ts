import { Controller, Get, Post, Body, Query, BadRequestException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { TraceService } from "./trace.service";
import { AuthService } from "../auth/auth.service";
import {
  MintTraceDto,
  UpdateTraceDto,
  RevokeTraceDto,
  BurnTraceDto,
  MintConfirmDto,
  UpdateConfirmDto,
  RevokeConfirmDto,
  BurnConfirmDto,
  RemoveWarehouseItemDto,
  SubmitTxDto,
} from "./dto/trace.dto";

const ENTERPRISE_ROLE = "ENTERPRISE";

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
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can list product batches (minted ref100).");
    }
    const items = await this.trace.listBatches(profileId);
    return { total: items.length, items };
  }

  @Get("warehouses")
  async getMyWarehouse(
    @Query("token") token?: string,
  ): Promise<{
    items: { batchId: string; batchName: string; image: string | null; quantity: number; mintedAt: Date; policyId: string | null }[];
  }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    const allowed = ["ENTERPRISE", "TRANSIT", "AGENT"].includes((role ?? "").toUpperCase());
    if (!allowed) {
      throw new ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can access warehouse.");
    }
    const items = await this.trace.listMyWarehouseInventory(profileId);
    return { items };
  }

  @Get("lock-recipient-by-roadmap")
  async getLockRecipientByRoadmap(
    @Query("batchId") batchId: string | undefined,
    @Query("token") token: string | undefined,
  ): Promise<{ recipientAddress: string | null }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    const allowed = ["ENTERPRISE", "TRANSIT", "AGENT"].includes((role ?? "").toUpperCase());
    if (!allowed) {
      throw new ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can use lock-recipient-by-roadmap.");
    }
    if (!batchId || typeof batchId !== "string" || !batchId.trim()) {
      return { recipientAddress: null };
    }
    return this.trace.getLockRecipientByRoadmap(profileId, batchId.trim());
  }

  @Post("warehouses/remove-item")
  async removeWarehouseItem(
    @Body() body: RemoveWarehouseItemDto,
    @Query("token") token?: string,
  ): Promise<{ ok: boolean }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    const allowed = ["ENTERPRISE", "TRANSIT", "AGENT"].includes((role ?? "").toUpperCase());
    if (!allowed) {
      throw new ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can remove item from warehouse.");
    }
    if (!body.batchId || typeof body.batchId !== "string" || !body.batchId.trim()) {
      throw new BadRequestException("batchId is required.");
    }
    await this.trace.removeOneFromWarehouse(profileId, body.batchId.trim());
    return { ok: true };
  }

  @Post("warehouses/mark-shipped")
  async markWarehouseItemShipped(
    @Body() body: RemoveWarehouseItemDto,
    @Query("token") token?: string,
  ): Promise<{ ok: boolean }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    const allowed = ["ENTERPRISE", "TRANSIT", "AGENT"].includes((role ?? "").toUpperCase());
    if (!allowed) {
      throw new ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can mark item as shipped.");
    }
    if (!body.batchId || typeof body.batchId !== "string" || !body.batchId.trim()) {
      throw new BadRequestException("batchId is required.");
    }
    await this.trace.markAsShipped(profileId, body.batchId.trim());
    return { ok: true };
  }

  @Post("mint")
  async mint(
    @Body() body: MintTraceDto,
    @Query("token") token?: string,
  ): Promise<{ unsignedTx: string; policyId?: string }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can mint (ProductBatch/ref100). Other roles can only burn NFT 222.");
    }
    if (!body.changeAddress || !body.assetName) {
      throw new BadRequestException("Missing changeAddress or assetName");
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
        "Missing metadata or (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)",
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
    @Query("token") token?: string,
  ): Promise<{ unsignedTx: string }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can update (ProductBatch/ref100).");
    }
    if (!body.changeAddress || !body.assetName) {
      throw new BadRequestException("Missing changeAddress or assetName");
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
        "Missing metadata or (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)",
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
    @Query("token") token?: string,
  ): Promise<{ unsignedTx: string }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can revoke (ProductBatch/ref100).");
    }
    if (!body.changeAddress || !body.assetName) {
      throw new BadRequestException("Missing changeAddress or assetName");
    }
    return this.trace.revoke({
      changeAddress: body.changeAddress,
      assetName: body.assetName,
      txHash: body.txHash,
      walletUtxos: body.walletUtxos as any,
      utxoAddresses: body.utxoAddresses,
    });
  }

  @Post("burn")
  async burn(
    @Body() body: BurnTraceDto,
  ): Promise<{ unsignedTx: string }> {
    if (!body.changeAddress || !body.assetName) {
      throw new BadRequestException("Missing changeAddress or assetName");
    }
    return this.trace.burn({
      changeAddress: body.changeAddress,
      assetName: body.assetName,
      txHash: body.txHash,
      policyId: body.policyId,
      walletUtxos: body.walletUtxos as any,
      utxoAddresses: body.utxoAddresses,
    });
  }

  @Post("mint/confirm")
  async mintConfirm(
    @Body() body: MintConfirmDto,
    @Query("token") token?: string,
  ): Promise<{ ok: boolean }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can confirm mint.");
    }
    if (!body.txHash || !body.assetName || !body.name || body.minterProfileId == null) {
      throw new BadRequestException("Missing txHash, assetName, name or minterProfileId");
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
      policyId: body.policyId,
      receivers: body.receivers,
    });
    return { ok: true };
  }

  @Post("update/confirm")
  async updateConfirm(
    @Body() body: UpdateConfirmDto,
    @Query("token") token?: string,
  ): Promise<{ ok: boolean }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can confirm update.");
    }
    if (!body.txHash || !body.assetName || body.profileId == null) {
      throw new BadRequestException("Missing txHash, assetName or profileId");
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
      receivers: body.receivers,
    });
    return { ok: true };
  }

  @Post("revoke/confirm")
  async revokeConfirm(
    @Body() body: RevokeConfirmDto,
    @Query("token") token?: string,
  ): Promise<{ ok: boolean }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can confirm revoke.");
    }
    if (!body.txHash || !body.assetName || body.profileId == null) {
      throw new BadRequestException("Missing txHash, assetName or profileId");
    }
    await this.trace.recordTx({
      action: "REVOKE",
      txHash: body.txHash,
      assetName: body.assetName,
      profileId: body.profileId,
      receivers: body.receivers,
    });
    return { ok: true };
  }

  @Post("burn/confirm")
  async burnConfirm(
    @Body() body: BurnConfirmDto,
  ): Promise<{ ok: boolean }> {
    if (!body.txHash || !body.assetName || body.profileId == null) {
      throw new BadRequestException("Missing txHash, assetName or profileId");
    }
    await this.trace.recordTx({
      action: "BURN",
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
      throw new BadRequestException("Missing signedTx or signedTxBase64");
    }
    return this.trace.submitSignedTx(raw, !!body.signedTxBase64);
  }
}
