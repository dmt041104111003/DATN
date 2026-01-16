import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  servicePlanId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsString()
  @IsOptional()
  status?: string; // 'pending' | 'active' | 'expired' | 'cancelled'
}
