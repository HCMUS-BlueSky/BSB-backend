import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  data: string;
}
