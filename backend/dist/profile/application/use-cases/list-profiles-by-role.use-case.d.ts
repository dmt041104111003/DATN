import { ProfileBasic, ProfileRepositoryPort } from "../../domain/profile.repository";
export declare class ListProfilesByRoleUseCase {
    private readonly repository;
    constructor(repository: ProfileRepositoryPort);
    execute(roleCode: string): Promise<ProfileBasic[]>;
}
