import { IsEmail, IsNotEmpty, IsStrongPassword, MinLength } from 'class-validator';

export class ChangePasswordDto {

  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsStrongPassword()
  newPassword: string;
}
