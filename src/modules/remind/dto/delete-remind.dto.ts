import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteRemindDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}
