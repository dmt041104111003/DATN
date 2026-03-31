import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class ProductContractSaveDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  owners: string[];

  @IsString()
  @IsNotEmpty()
  lotReference: string;

  @IsObject()
  passport: Record<string, string>;
}

