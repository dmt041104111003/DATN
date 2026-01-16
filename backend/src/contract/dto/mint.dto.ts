import { IsString, IsOptional, IsObject } from 'class-validator';

export class MintDto {
  @IsString()
  assetName: string;

  @IsObject()
  metadata: Record<string, string>;

  @IsString()
  @IsOptional()
  quantity?: string;

  @IsString()
  @IsOptional()
  receiver?: string;
}
