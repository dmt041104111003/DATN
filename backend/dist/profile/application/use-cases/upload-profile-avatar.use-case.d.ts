import { ProfileRepositoryPort, UpdatedProfileWithRelations } from "../../domain/profile.repository";
import { AvatarStoragePort } from "../../domain/avatar-storage.port";
export declare class UploadProfileAvatarUseCase {
    private readonly repository;
    private readonly avatarStorage;
    constructor(repository: ProfileRepositoryPort, avatarStorage: AvatarStoragePort);
    execute(profileId: number, imageDataUrl: string): Promise<UpdatedProfileWithRelations>;
}
