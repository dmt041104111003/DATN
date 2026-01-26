import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpsertAgentDto {
  @IsString()
  walletAddress: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  gpsLatitude?: number;

  @IsOptional()
  @IsNumber()
  gpsLongitude?: number;
}

