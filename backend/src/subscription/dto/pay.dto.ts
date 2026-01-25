import { IsString } from 'class-validator';

export class PayDto {
  @IsString()
  servicePlanId: string;

  @IsString()
  txHash: string;
}
