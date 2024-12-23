import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMobilePhone, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  fullName: string;

  @ApiPropertyOptional()
  @IsMobilePhone()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  dob: Date;
}
