import { Inject, Injectable } from "@nestjs/common";
import {
  PROFILE_REPOSITORY,
  ProfileBasic,
  ProfileRepositoryPort,
} from "../../domain/profile.repository";

@Injectable()
export class ListProfilesByRoleUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repository: ProfileRepositoryPort
  ) {}

  async execute(roleCode: string): Promise<ProfileBasic[]> {
    const code = (roleCode || "").trim().toUpperCase();
    if (!code) return [];

    const role = await this.repository.findRoleByCode(code);
    if (!role) return [];

    return this.repository.listProfilesByRoleId(role.id);
  }
}

