import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { JWS } from 'node-jose';

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;
}

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @IsNotEmpty()
  token: JWS.CreateSignResult;

  @IsNotEmpty()
  message: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class ResendEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  new_password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  confirm_password: string;
}

export class RefreshTokenRequestDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class ResetPwdDto {
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
