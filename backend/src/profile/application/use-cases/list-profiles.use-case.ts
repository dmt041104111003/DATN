import { Inject, Injectable } from "@nestjs/common";
import {
  PROFILE_REPOSITORY,
  ProfileListItem,
  ProfileRepositoryPort,
} from "../../domain/profile.repository";

@Injectable()
export class ListProfilesUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repository: ProfileRepositoryPort
  ) {}

  execute(): Promise<ProfileListItem[]> {
    return this.repository.listAllProfiles();
  }
}

