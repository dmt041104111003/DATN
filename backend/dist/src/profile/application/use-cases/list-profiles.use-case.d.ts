import { ProfileListItem, ProfileRepositoryPort } from "../../domain/profile.repository";
export declare class ListProfilesUseCase {
    private readonly repository;
    constructor(repository: ProfileRepositoryPort);
    execute(): Promise<ProfileListItem[]>;
}
