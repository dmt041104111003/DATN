import { Inject, Injectable } from "@nestjs/common";
import {
  PROFILE_REPOSITORY,
  ProfileRepositoryPort,
  UpdatedProfileWithRelations,
  UpdateProfileData,
} from "../../domain/profile.repository";

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repository: ProfileRepositoryPort
  ) {}

  execute(
    profileId: number,
    data: UpdateProfileData
  ): Promise<UpdatedProfileWithRelations> {
    return this.repository.updateProfileById(profileId, data);
  }
}

