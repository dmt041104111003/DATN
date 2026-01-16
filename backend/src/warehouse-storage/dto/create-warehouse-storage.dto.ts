import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateWarehouseStorageDto {
  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsDateString()
  entryTime: string;

  @IsDateString()
  @IsOptional()
  exitTime?: string;

  @IsString()
  @IsOptional()
  conditions?: string;
}
