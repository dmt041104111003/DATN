import { IsString, MinLength } from "class-validator";

export class TraceBodyDto {
  @IsString()
  @MinLength(1)
  policyId!: string;

  @IsString()
  @MinLength(1)
  assetName!: string;
}
