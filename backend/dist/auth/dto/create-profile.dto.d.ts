import { StakeAddressInputDto } from "./stake-address.dto";
export declare class CreateProfileDto extends StakeAddressInputDto {
    roleCode: string;
    displayName: string;
    location?: string;
    coordinates?: string;
}
