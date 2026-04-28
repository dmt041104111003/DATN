import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class ProductionContractSaveDto {
  @IsArray()
  owners: string[];

  @IsString()
  @IsNotEmpty()
  inventoryKey: string;

  @IsObject()
  metadata: Record<string, string>;
}
