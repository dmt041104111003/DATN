import { IsString, IsOptional } from 'class-validator';

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  gpsCoordinates?: string;

  @IsString()
  @IsOptional()
  contactInfo?: string;
}
