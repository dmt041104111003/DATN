import { Controller, Get, Post, Body, Query, BadRequestException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { WarehouseService } from "./warehouse.service";
import { WarehouseBatchIdDto } from "./dto/warehouse.dto";

const WAREHOUSE_ROLES = ["ENTERPRISE", "TRANSIT", "AGENT"] as const;

@Controller("warehouse")
export class WarehouseController {
  constructor(
    private readonly warehouse: WarehouseService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  async getMyWarehouse(
    @Query("token") token?: string,
  ): Promise<{
    items: {
      batchId: string;
      batchName: string;
      image: string | null;
      receivedAt: Date;
      outAt: Date | null;
      policyId: string | null;
      status: string;
    }[];
  }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if (!WAREHOUSE_ROLES.includes((role ?? "").toUpperCase() as (typeof WAREHOUSE_ROLES)[number])) {
      throw new ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can access warehouse.");
    }
    const items = await this.warehouse.listMyWarehouseInventory(profileId);
    return { items };
  }

  @Post("remove-item")
  async removeItem(
    @Body() body: WarehouseBatchIdDto,
    @Query("token") token?: string,
  ): Promise<{ ok: boolean }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if (!WAREHOUSE_ROLES.includes((role ?? "").toUpperCase() as (typeof WAREHOUSE_ROLES)[number])) {
      throw new ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can remove item from warehouse.");
    }
    if (!body.batchId || typeof body.batchId !== "string" || !body.batchId.trim()) {
      throw new BadRequestException("batchId is required.");
    }
    await this.warehouse.removeOneFromWarehouse(profileId, body.batchId.trim());
    return { ok: true };
  }

  @Post("mark-shipped")
  async markShipped(
    @Body() body: WarehouseBatchIdDto,
    @Query("token") token?: string,
  ): Promise<{ ok: boolean }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if (!WAREHOUSE_ROLES.includes((role ?? "").toUpperCase() as (typeof WAREHOUSE_ROLES)[number])) {
      throw new ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can mark item as shipped.");
    }
    if (!body.batchId || typeof body.batchId !== "string" || !body.batchId.trim()) {
      throw new BadRequestException("batchId is required.");
    }
    await this.warehouse.markAsShipped(profileId, body.batchId.trim());
    return { ok: true };
  }

  @Get("recipient-by-roadmap")
  async getRecipientByRoadmap(
    @Query("batchId") batchId: string | undefined,
    @Query("token") token: string | undefined,
  ): Promise<{ recipientAddress: string | null }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if (!WAREHOUSE_ROLES.includes((role ?? "").toUpperCase() as (typeof WAREHOUSE_ROLES)[number])) {
      throw new ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can use recipient-by-roadmap.");
    }
    if (!batchId || typeof batchId !== "string" || !batchId.trim()) {
      return { recipientAddress: null };
    }
    return this.warehouse.getRecipientByRoadmap(profileId, batchId.trim());
  }
}
