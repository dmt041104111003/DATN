import { Inject, Injectable } from "@nestjs/common";
import {
  PROFILE_REPOSITORY,
  ProfileRepositoryPort,
  UpdatedProfileWithRelations,
} from "../../domain/profile.repository";
import {
  AVATAR_STORAGE,
  AvatarStoragePort,
} from "../../domain/avatar-storage.port";

@Injectable()
export class UploadProfileAvatarUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repository: ProfileRepositoryPort,
    @Inject(AVATAR_STORAGE)
    private readonly avatarStorage: AvatarStoragePort
  ) {}

  async execute(
    profileId: number,
    imageDataUrl: string
  ): Promise<UpdatedProfileWithRelations> {
    const avatarUrl = await this.avatarStorage.uploadAvatar(imageDataUrl);
    return this.repository.updateProfileAvatarById(profileId, avatarUrl);
  }
}

