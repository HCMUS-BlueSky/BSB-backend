import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';

export class ExternalAccountInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  accountNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  bankId: string;
}
