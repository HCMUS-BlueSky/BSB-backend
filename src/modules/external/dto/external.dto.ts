import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsString, Min } from 'class-validator';
import { PAYER } from 'src/common/constants';

export class ExternalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  fromAccountNumber: string;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  toAccountNumber: string;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(100)
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PAYER)
  feePayer: PAYER;
}
