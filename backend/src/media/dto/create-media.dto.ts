import { IsString } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  url: string;
}