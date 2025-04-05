import { IsNotEmpty, IsOptional, IsBoolean, IsDateString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCandidateDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  imageUrl?: string;
}

export class CreateBallotDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ValidateNested({ each: true })
  @Type(() => CreateCandidateDto)
  @ArrayMinSize(1)
  candidates: CreateCandidateDto[];
} 