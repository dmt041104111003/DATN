import { Body, Controller, Post, Query, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
  constructor(
    private readonly upload: UploadService,
    private readonly auth: AuthService,
  ) {}

  @Post("image")
  async uploadImage(
    @Query("token") token?: string,
    @Body() body?: { imageDataUrl?: string; folder?: string },
  ): Promise<{ url: string }> {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new UnauthorizedException("Missing or invalid token.");
    }
    await this.auth.getProfileIdFromToken(token.trim());

    const imageDataUrl = body?.imageDataUrl;
    if (!imageDataUrl || typeof imageDataUrl !== "string" || !imageDataUrl.trim()) {
      throw new BadRequestException("imageDataUrl is required.");
    }

    const folder = (body?.folder && typeof body.folder === "string" && body.folder.trim())
      ? body.folder.trim()
      : "uploads";

    const url = await this.upload.uploadImage(imageDataUrl, folder);
    return { url };
  }
}
