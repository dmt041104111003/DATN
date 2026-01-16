import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  userId: string;

  @IsString()
  subscriptionId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  txHash: string;

  @IsDateString()
  paymentDate: string;
}