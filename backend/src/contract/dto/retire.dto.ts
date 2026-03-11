import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RetireAssetDto {
  @IsString()
  @IsNotEmpty()
  assetName: string;
}

/**
 * Retire = burn CIP-68 user token (222) only.
 * This must NOT touch the reference token (100).
 */
export class RetireDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsArray()
  @IsString({ each: true })
  owners: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RetireAssetDto)
  assets: RetireAssetDto[];
}

