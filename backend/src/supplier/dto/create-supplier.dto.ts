import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    name: string;
  
    @IsString()
    @IsOptional()
    location?: string;
  
    @IsString()
    userId: string;  // Supplier thuộc về user nào
  }