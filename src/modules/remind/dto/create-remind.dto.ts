import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  Min,
} from 'class-validator';

export class CreateRemindDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  accountNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  amount: number;
}
