import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BurnAssetDto {
  @IsString()
  @IsNotEmpty()
  assetName: string;
}

export class BurnDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsArray()
  @IsString({ each: true })
  owners: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BurnAssetDto)
  assets: BurnAssetDto[];
}
