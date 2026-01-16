import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  servicePlanId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  status?: string;
}