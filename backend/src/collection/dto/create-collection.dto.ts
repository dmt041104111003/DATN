import { IsString, IsOptional } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
