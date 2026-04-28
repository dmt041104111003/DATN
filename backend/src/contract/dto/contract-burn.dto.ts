import { IsArray } from 'class-validator';

export class ContractBurnDto {
  @IsArray()
  owners: string[];

  @IsArray()
  productionInventoryKeys: string[];
}
