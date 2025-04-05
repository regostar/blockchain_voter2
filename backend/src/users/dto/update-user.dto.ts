import { IsEmail, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  walletAddress?: string;

  @IsOptional()
  voterToken?: string;
} 