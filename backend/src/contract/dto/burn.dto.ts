import { IsString } from 'class-validator';

export class BurnDto {
  @IsString()
  assetName: string;

  @IsString()
  quantity: string;
}
