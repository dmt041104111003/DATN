import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ContractBatchCreateItemDto {
  @IsString()
  assetName: string;

  @IsObject()
  metadata: Record<string, string>;
}

export class ContractBatchCreateDto {
  @IsArray()
  owners: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ContractBatchCreateItemDto)
  items: ContractBatchCreateItemDto[];

  @IsString()
  @IsOptional()
  assetName?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;
}
