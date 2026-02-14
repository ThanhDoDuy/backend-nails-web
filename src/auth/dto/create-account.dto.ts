import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  // Salon info
  @IsNotEmpty()
  @IsString()
  salonName: string;

  @IsNotEmpty()
  @IsString()
  salonSlug: string;

  @IsOptional()
  @IsString()
  salonPhone?: string;

  @IsOptional()
  @IsString()
  salonAddress?: string;

  // Owner info
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
