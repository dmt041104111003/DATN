import { IsString, IsObject } from 'class-validator';

export class UpdateMetadataDto {
  @IsString()
  assetName: string;

  @IsObject()
  metadata: Record<string, string>;
}
