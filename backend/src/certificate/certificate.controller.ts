import { Controller, Get, Post, Body, Param, Query, BadRequestException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { CertificateService } from "./certificate.service";
import { CreateCertificateDto } from "./dto/certificate.dto";

const ENTERPRISE_ROLE = "ENTERPRISE";

@Controller("certificate")
export class CertificateController {
  constructor(
    private readonly certificate: CertificateService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  async list(
    @Query("token") token?: string,
    @Query("batchId") batchId?: string,
    @Query("search") search?: string,
    @Query("page") pageStr?: string,
    @Query("pageSize") pageSizeStr?: string,
  ) {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can manage certificates.");
    }

    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const pageSize = pageSizeStr ? parseInt(pageSizeStr, 10) : 20;

    return this.certificate.list(profileId, {
      batchId: batchId?.trim() || undefined,
      search: search?.trim() || undefined,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 20,
    });
  }

  @Get(":id")
  async getById(
    @Param("id") idStr: string,
    @Query("token") token?: string,
  ) {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can view certificates.");
    }
    const id = parseInt(idStr, 10);
    if (!Number.isFinite(id)) {
      throw new BadRequestException("Invalid certificate id.");
    }
    return this.certificate.getById(id, profileId);
  }

  @Post()
  async create(
    @Body() body: CreateCertificateDto,
    @Query("token") token?: string,
  ): Promise<{ id: number; title: string; imageUrl: string | null }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can create certificates.");
    }
    if (!body.title?.trim() || !body.batchId?.trim()) {
      throw new BadRequestException("title and batchId are required.");
    }
    if (!body.imageUrl?.trim()) {
      throw new BadRequestException("imageUrl is required (upload image via POST /upload/image first).");
    }
    return this.certificate.create(profileId, {
      title: body.title,
      batchId: body.batchId,
      imageUrl: body.imageUrl,
      metadata: body.metadata,
    });
  }
}
