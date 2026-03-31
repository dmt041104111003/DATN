import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AreaContractDeleteDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  @IsString({ each: true })
  owners: string[];

  @IsString()
  @IsNotEmpty()
  inventoryKey: string;
}

