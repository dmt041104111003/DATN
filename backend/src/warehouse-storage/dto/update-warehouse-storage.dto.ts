import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateWarehouseStorageDto {
  @IsDateString()
  @IsOptional()
  entryTime?: string;

  @IsDateString()
  @IsOptional()
  exitTime?: string;

  @IsString()
  @IsOptional()
  conditions?: string;
}