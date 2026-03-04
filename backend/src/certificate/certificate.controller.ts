import { Controller, Get, Post, Put, Body, Param, Query, BadRequestException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
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
    @Query("search") search?: string,
    @Query("attachedToBatchId") attachedToBatchId?: string,
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
      search: search?.trim() || undefined,
      attachedToBatchId: attachedToBatchId?.trim() || undefined,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 20,
    });
  }

  @Get("batch/:batchId/ids")
  async getCertificateIdsByBatch(
    @Param("batchId") batchId: string,
    @Query("token") token?: string,
  ) {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can manage certificates.");
    }
    const ids = await this.certificate.getCertificateIdsByBatchId(
      batchId.trim(),
      profileId
    );
    return { certificateIds: ids };
  }

  @Put("batch/:batchId")
  async setCertificatesForBatch(
    @Param("batchId") batchId: string,
    @Body() body: { certificateIds?: number[] },
    @Query("token") token?: string,
  ) {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    const profileId = await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can manage certificates.");
    }
    const certificateIds = Array.isArray(body?.certificateIds)
      ? body.certificateIds.filter((n) => Number.isFinite(n))
      : [];
    await this.certificate.setCertificatesForBatch(
      batchId.trim(),
      profileId,
      certificateIds
    );
    return { ok: true };
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
    if (!body.title?.trim()) {
      throw new BadRequestException("title is required.");
    }
    if (!body.imageUrl?.trim()) {
      throw new BadRequestException("imageUrl is required (upload image via POST /upload/image first).");
    }
    if (!body.number?.trim()) {
      throw new BadRequestException("Certificate number (No.) is required.");
    }
    if (!body.authority?.trim()) {
      throw new BadRequestException("Certificate authority is required.");
    }
    return this.certificate.create(profileId, {
      title: body.title,
      imageUrl: body.imageUrl,
      number: body.number,
      authority: body.authority,
      expiryDate: body.expiryDate,
      documentType: body.documentType,
      standardReference: body.standardReference,
      scope: body.scope,
      documentUrl: body.documentUrl,
    });
  }
}
