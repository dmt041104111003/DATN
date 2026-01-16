import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdatePaymentDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;
}