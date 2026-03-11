import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  receiver: string;

  @IsString()
  @IsNotEmpty()
  policyId: string;

  @IsString()
  @IsNotEmpty()
  assetName: string;

  @IsString()
  @IsOptional()
  quantity?: string;
}

