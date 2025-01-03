import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, Length, IsMongoId } from 'class-validator';

export class ConfirmExternalTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Length(6)
  otp: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  transaction: string;
}
