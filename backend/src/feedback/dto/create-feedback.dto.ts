import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  productId: string;

  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  rating?: number;
}
