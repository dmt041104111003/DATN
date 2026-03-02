import { IsDefined, IsInt, IsOptional, IsString, Min } from "class-validator";
import { StakeAddressInputDto } from "./stake-address.dto";

export class CreateProfileDto extends StakeAddressInputDto {
  @IsInt()
  @Min(1)
  roleId!: number;

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

