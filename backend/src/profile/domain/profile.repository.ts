export interface ProfileListItem {
  walletAddress: string;
  displayName: string;
  location: string | null;
  coordinates: string | null;
  role: string | null;
}

export interface ProfileBasic {
  id: number;
  displayName: string;
  walletAddress: string;
}

export interface UpdateProfileData {
  displayName: string;
  location?: string;
  coordinates?: string;
}

export interface UpdatedProfileWithRelations {
  id: number;
  displayName: string;
  walletAddress: string;
  avatarUrl: string | null;
  location: string | null;
  coordinates: string | null;
  roleCode: string;
}

export interface ProfileRepositoryPort {
  listAllProfiles(): Promise<ProfileListItem[]>;

  listProfilesByRoleCode(roleCode: string): Promise<ProfileBasic[]>;

  updateProfileById(
    id: number,
    data: UpdateProfileData
  ): Promise<UpdatedProfileWithRelations>;

  updateProfileAvatarById(
    id: number,
    avatarUrl: string
  ): Promise<UpdatedProfileWithRelations>;
}

export const PROFILE_REPOSITORY = "PROFILE_REPOSITORY";

