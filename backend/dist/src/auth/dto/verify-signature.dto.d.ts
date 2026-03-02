import { StakeAddressInputDto } from "./stake-address.dto";
export declare class VerifySignatureDto extends StakeAddressInputDto {
    nonce: string;
    signature: string;
    key: string;
}
