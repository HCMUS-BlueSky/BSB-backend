import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { RECEIVER_TYPE } from 'src/common/constants';

export class CreateReceiverDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  accountNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nickname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(RECEIVER_TYPE)
  type: RECEIVER_TYPE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bank: string;
}
