import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIP, IsUrl, Matches, IsEnum } from 'class-validator';
import { BANK_TYPE } from 'src/common/constants';

export class CreateBankDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  logo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIP()
  ip: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUrl({ require_tld: false })
  baseUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/^(\/\w+)+$/)
  publicKeyPath: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/^(\/\w+)+$/)
  accountInfoPath: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/^(\/\w+)+$/)
  transferPath: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(BANK_TYPE)
  type: string;
}
