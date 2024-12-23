import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}