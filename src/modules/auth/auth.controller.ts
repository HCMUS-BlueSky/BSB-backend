import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResendEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { BaseController } from 'src/vendors/base';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  // @ApiTags('Auth')
  // @Post('register')
  // @ApiOperation({
  //   summary: 'Register account',
  //   description: 'Register user account with email, username and password',
  // })
  // @ApiResponse({ status: 201, description: 'Success' })
  // async register(@Body() registerUserDto: RegisterUserDto) {
  //   return this.response(await this.authService.register(registerUserDto));
  // }

  // @ApiTags('Auth')
  // @Post('login')
  // @ApiOperation({
  //   summary: 'Login account',
  //   description: 'Login user account with email and password',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Success',
  //   headers: { 'Set-Cookie': { description: 'Set JWT cookie for user' } },
  // })
  // async login(
  //   @Body() loginUserDto: LoginUserDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const { token, message } = await this.authService.login(loginUserDto);
  //   response.cookie('token', token, {
  //     httpOnly: true,
  //     domain: this.configService.get<string>('DOMAIN') || 'localhost',
  //   });
  //   return this.response(message);
  // }

  // @ApiTags('Auth')
  // @Post('confirm')
  // @ApiOperation({
  //   summary: "Verify user's email address",
  //   description: "Verify user's email address using the provided token",
  // })
  // @ApiResponse({ status: 201, description: 'Success' })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid token, id or expired token',
  // })
  // async confirm(@Body() verifyEmailDto: VerifyEmailDto) {
  //   return this.response(await this.authService.confirm(verifyEmailDto));
  // }

  // @ApiTags('Auth')
  // @Post('resend-email')
  // @ApiOperation({
  //   summary: 'Resend verification email',
  //   description: "Resend verification email to user's email address",
  // })
  // @ApiResponse({ status: 201, description: 'Success' })
  // @ApiResponse({
  //   status: 400,
  //   description: 'This account does not exist or already verified',
  // })
  // @Throttle({ default: { limit: 1, ttl: 60000 } })
  // async resend(@Body() resendEmailDto: ResendEmailDto) {
  //   return this.response(await this.authService.resend(resendEmailDto));
  // }

  // @ApiTags('Auth')
  // @Post('forgot-password')
  // @ApiOperation({
  //   summary: 'Send reset password email',
  //   description: "Send reset password email to user's email address",
  // })
  // @ApiResponse({ status: 201, description: 'Success' })
  // @ApiResponse({
  //   status: 400,
  //   description: 'This account does not exist or is not verified',
  // })
  // @Throttle({ default: { limit: 1, ttl: 60000 } })
  // async forgot(@Body() forgotPasswordDto: ForgotPasswordDto) {
  //   return this.response(
  //     await this.authService.forgotPassword(forgotPasswordDto),
  //   );
  // }

  // @ApiTags('Auth')
  // @Post('reset-password')
  // @ApiOperation({
  //   summary: "Reset user's password",
  //   description: 'Reset password of user',
  // })
  // @ApiResponse({ status: 201, description: 'Success' })
  // @ApiResponse({
  //   status: 400,
  //   description:
  //     'Invalid token, id, expired token or confirm password does not match with password',
  // })
  // async reset(@Body() resetPasswordDto: ResetPasswordDto) {
  //   return this.response(
  //     await this.authService.resetPassword(resetPasswordDto),
  //   );
  // }
}
