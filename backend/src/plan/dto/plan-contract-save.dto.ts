import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class PlanContractSaveDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  owners: string[];

  @IsString()
  @IsNotEmpty()
  inventoryKey: string;

  @IsString()
  @IsNotEmpty()
  cropType: string;

  @IsOptional()
  @IsString()
  seedCertificateIpfs?: string;

  @IsOptional()
  @IsString()
  seedInvoiceIpfs?: string;

  @IsOptional()
  @IsString()
  harvestImageIpfs?: string;

  @IsOptional()
  @IsString()
  packagingImageIpfs?: string;

  @IsObject()
  plannedTimeline: Record<string, unknown>;

  @IsObject()
  quantities: Record<string, unknown>;
}

