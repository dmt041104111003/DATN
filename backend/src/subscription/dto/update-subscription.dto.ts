import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
