import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class AccountHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  accountNumber: string;
}
