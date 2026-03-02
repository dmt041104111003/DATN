import { ProfileRepositoryPort, UpdatedProfileWithRelations, UpdateProfileData } from "../../domain/profile.repository";
export declare class UpdateProfileUseCase {
    private readonly repository;
    constructor(repository: ProfileRepositoryPort);
    execute(profileId: number, data: UpdateProfileData): Promise<UpdatedProfileWithRelations>;
}
