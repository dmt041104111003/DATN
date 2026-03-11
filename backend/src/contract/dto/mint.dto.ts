import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsObject,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class MintAssetDto {
  @IsString()
  @IsNotEmpty()
  assetName: string;

  @IsString()
  @IsOptional()
  quantity?: string;

  @IsObject()
  @IsNotEmpty()
  metadata: Record<string, string>;

  @IsString()
  @IsOptional()
  receiver?: string;
}

export class MintDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsArray()
  @IsString({ each: true })
  owners: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MintAssetDto)
  assets: MintAssetDto[];
}
