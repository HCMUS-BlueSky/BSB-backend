import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class ResendTransactionOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  transaction: string;
}
