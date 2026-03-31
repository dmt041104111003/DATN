import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ProductContractCreateDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  owners: string[];

  @IsString()
  @IsOptional()
  lotReference?: string;

  @IsObject()
  passport: Record<string, string>;
}

