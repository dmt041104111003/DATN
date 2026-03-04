import { IsDefined, IsOptional, IsString } from "class-validator";
import { StakeAddressInputDto } from "./stake-address.dto";

export class CreateProfileDto extends StakeAddressInputDto {
  @IsString()
  @IsDefined()
  roleCode!: string;

  @IsString()
  @IsDefined()
  displayName!: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  coordinates?: string;
}

