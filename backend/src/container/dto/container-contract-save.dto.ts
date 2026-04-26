import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class ContainerContractSaveDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  owners: string[];

  @IsString()
  @IsNotEmpty()
  inventoryKey: string;

  @IsObject()
  metadata: Record<string, string>;
}
