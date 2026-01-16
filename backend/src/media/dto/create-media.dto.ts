import { IsString } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  url: string;
}
