import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CustomerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['new', 'bronze', 'silver', 'gold', 'platinum'])
  tier?: string;
}
