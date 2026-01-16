import { IsString, IsOptional } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    name: string;
  
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