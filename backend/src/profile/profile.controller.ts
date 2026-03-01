import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Query } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { ProfileService } from "./profile.service";

@Controller("profile")
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
  ) {}

  @Get("profiles")
  async listProfiles(@Query("token") token?: string) {
    if (!token) {
      throw new HttpException(
        { error: "Missing token" },
        HttpStatus.BAD_REQUEST
      );
    }
    return this.profileService.listProfilesFromToken(token);
  }

  @Get("profiles/by-role")
  async listProfilesByRole(
    @Query("role") role?: string,
    @Query("token") token?: string,
  ) {
    if (!role?.trim()) {
      throw new HttpException(
        { error: "Missing role" },
        HttpStatus.BAD_REQUEST
      );
    }
    if (!token?.trim()) {
      throw new HttpException(
        { error: "Missing token" },
        HttpStatus.UNAUTHORIZED
      );
    }
    await this.authService.getProfileIdFromToken(token.trim());
    return this.profileService.listProfilesByRoleCode(role.trim());
  }

  @Patch()
  async updateProfile(
    @Body()
    body: {
      token?: string;
      displayName?: string;
      location?: string;
      coordinates?: string;
    }
  ) {
    const { token, displayName, location, coordinates } = body;

    if (!token || !displayName) {
      throw new HttpException(
        { error: "Missing profile update information" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.profileService.updateProfileFromToken({
      token,
      displayName,
      location,
      coordinates,
    });
  }

  @Post("avatar")
  async uploadAvatar(
    @Body()
    body: {
      token?: string;
      imageDataUrl?: string;
    }
  ) {
    const { token, imageDataUrl } = body;

    if (!token || !imageDataUrl) {
      throw new HttpException(
        { error: "Missing avatar upload information" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.profileService.uploadProfileAvatarFromToken({
      token,
      imageDataUrl,
    });
  }
}
