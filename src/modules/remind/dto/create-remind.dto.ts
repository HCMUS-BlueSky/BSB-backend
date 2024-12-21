import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRemindDto {
  @ApiProperty()
  @IsNotEmpty()
  remindUserAccount: string;

  @ApiProperty()
  @IsNotEmpty()
  remindMessage: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
