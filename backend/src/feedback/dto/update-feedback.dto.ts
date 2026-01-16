import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateFeedbackDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;
}
