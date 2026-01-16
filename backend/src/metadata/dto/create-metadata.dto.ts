import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateMetadataDto {
  @IsString()
  collectionId: string;

  @IsString()
  @IsOptional()
  assetName?: string;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  nftReference?: string[];
}