import { Controller, Get, Post, Body, Query, Param, BadRequestException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { ProductService } from "./product.service";
import { AuthService } from "../auth/auth.service";
import {
  MintProductDto,
  UpdateProductDto,
  RevokeProductDto,
  BurnProductDto,
  MintConfirmDto,
  UpdateConfirmDto,
  RevokeConfirmDto,
  BurnConfirmDto,
  SubmitTxDto,
} from "./dto/product.dto";

const ENTERPRISE_ROLE = "ENTERPRISE";

@Controller("product")
export class ProductController {
  constructor(
    private readonly product: ProductService,
    private readonly auth: AuthService,
  ) {}

  @Get("batches")
  async listBatches(
    @Query("token") token?: string,
  ): Promise<{
    total: number;
    items: { id: number; batchId: string; name: string; description: string | null; image: string | null; createdAt: Date; policyId: string | null; sku: string | null; grossWeightKg: number | null; netWeightKg: number | null; originSiteCode: string | null }[];
  }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can list product batches (minted ref100).");
    }
    const items = await this.product.listBatches(profileId);
    return { total: items.length, items };
  }

  @Post("mint")
  async mint(
    @Body() body: MintProductDto,
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
    return this.product.mint({
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
    @Body() body: UpdateProductDto,
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
    return this.product.update({
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
      certUnit: body.certUnit,
      walletUtxos: body.walletUtxos as any,
      utxoAddresses: body.utxoAddresses,
    });
  }

  @Post("revoke")
  async revoke(
    @Body() body: RevokeProductDto,
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
    return this.product.revoke({
      changeAddress: body.changeAddress,
      assetName: body.assetName,
      txHash: body.txHash,
      walletUtxos: body.walletUtxos as any,
      utxoAddresses: body.utxoAddresses,
    });
  }

  @Post("burn")
  async burn(
    @Body() body: BurnProductDto,
  ): Promise<{ unsignedTx: string }> {
    if (!body.changeAddress || !body.assetName) {
      throw new BadRequestException("Missing changeAddress or assetName");
    }
    return this.product.burn({
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
    await this.product.recordTx({
      action: "MINT",
      txHash: body.txHash,
      assetName: body.assetName,
      profileId: body.minterProfileId,
      name: body.name,
      description: body.description,
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
    await this.product.recordTx({
      action: "UPDATE",
      txHash: body.txHash,
      assetName: body.assetName,
      profileId: body.profileId,
      name: body.name,
      description: body.description,
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
    await this.product.recordTx({
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
    await this.product.recordTx({
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
    return this.product.submitSignedTx(raw, !!body.signedTxBase64);
  }

  @Get("roadmap")
  async getRoadmap(
    @Query("code") code: string | undefined,
    @Query("token") token?: string,
  ): Promise<{ items: { stepIndex: number; toAddress: string | null }[] }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can read product roadmap.");
    }
    if (!code || typeof code !== "string" || !code.trim()) {
      return { items: [] };
    }
    const items = await this.product.listRoadmap(code.trim());
    return { items };
  }

  @Get("batch/:code")
  async getBatchByCode(
    @Param("code") code: string,
  ): Promise<{ policyId: string | null; assetName: string; nftUnit: string | null }> {
    if (!code || typeof code !== "string" || !code.trim()) {
      throw new BadRequestException("code is required");
    }
    return this.product.getBatchSummaryByCode(code.trim());
  }
}
