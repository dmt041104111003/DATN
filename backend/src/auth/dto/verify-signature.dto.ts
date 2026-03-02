import { IsDefined, IsString } from "class-validator";
import { StakeAddressInputDto } from "./stake-address.dto";

export class VerifySignatureDto extends StakeAddressInputDto {
  @IsString()
  @IsDefined()
  nonce!: string;

  @IsString()
  @IsDefined()
  signature!: string;

  @IsString()
  @IsDefined()
  key!: string;
}

