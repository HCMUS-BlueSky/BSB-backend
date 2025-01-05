import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsNumber,
  Min,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { PAYER } from 'src/common/constants';

export class CreateExternalTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  accountNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  bankId: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  saveAsReceiver: boolean;
}
