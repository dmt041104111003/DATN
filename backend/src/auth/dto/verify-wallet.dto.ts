import { IsString } from 'class-validator';

export class GetNonceDto {
  @IsString()
  address: string;
}

export class VerifyWalletDto {
  @IsString()
  address: string;

  @IsString()
  signature: string;

  @IsString()
  key: string;

  @IsString()
  walletName: string;
}
