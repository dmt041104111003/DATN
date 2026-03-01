import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthService } from "../auth/auth.service";
import { IpfsService } from "./ipfs.service";

const ENTERPRISE_ROLE = "ENTERPRISE";

@Controller("ipfs")
export class IpfsController {
  constructor(
    private readonly ipfs: IpfsService,
    private readonly auth: AuthService,
  ) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async upload(
    @UploadedFile() file: { buffer: Buffer; originalname?: string; mimetype?: string } | undefined,
    @Query("token") token?: string,
  ): Promise<{ ipfsHash: string }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    await this.auth.getProfileIdFromToken(token.trim());
    const role = await this.auth.getProfileRoleFromToken(token.trim());
    if ((role ?? "").toUpperCase() !== ENTERPRISE_ROLE) {
      throw new ForbiddenException("Only ENTERPRISE can upload to IPFS.");
    }
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(
        "No file uploaded. Send multipart/form-data with 'file' field.",
      );
    }
    const { ipfsHash } = await this.ipfs.uploadFile({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
    return { ipfsHash };
  }

  @Get("gateway-url/:hash")
  getGatewayUrl(@Param("hash") hash: string): { url: string } {
    const clean = (hash || "").trim().replace(/^ipfs:\/\//, "");
    if (!clean) {
      return { url: "" };
    }
    const url = this.ipfs.getGatewayUrl(clean);
    return { url };
  }
}
