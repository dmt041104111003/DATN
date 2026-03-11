import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAssetDto {
  @IsString()
  @IsNotEmpty()
  assetName: string;

  @IsObject()
  @IsNotEmpty()
  metadata: Record<string, string>;
}

export class UpdateDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsArray()
  @IsString({ each: true })
  owners: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAssetDto)
  assets: UpdateAssetDto[];
}
