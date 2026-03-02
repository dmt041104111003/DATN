import { StakeAddressInputDto } from "./stake-address.dto";
export declare class CreateProfileDto extends StakeAddressInputDto {
    roleId: number;
    displayName: string;
    location?: string;
    coordinates?: string;
}
