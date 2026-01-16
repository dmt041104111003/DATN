import { IsString, IsOptional } from 'class-validator';

export class UpdateMediaDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  url?: string;
}
