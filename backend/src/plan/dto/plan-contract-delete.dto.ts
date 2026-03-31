import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class PlanContractDeleteDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  owners: string[];

  @IsString()
  @IsNotEmpty()
  inventoryKey: string;
}

