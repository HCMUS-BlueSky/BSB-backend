import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { PAYER } from 'src/common/constants';

export class CreateInternalTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  accountNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(100)
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PAYER)
  feePayer: PAYER;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  description: string;
}
