import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ProductContractDeleteDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  owners: string[];

  @IsString()
  @IsNotEmpty()
  lotReference: string;
}

