import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateMetadataDto {
  @IsString()
  @IsOptional()
  assetName?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsOptional()
  nftReference?: string[];
}
