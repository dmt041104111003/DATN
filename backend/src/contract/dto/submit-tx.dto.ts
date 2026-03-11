import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitTxDto {
  @IsString()
  @IsNotEmpty()
  signedTx: string;
}
