import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
  Headers
} from '@nestjs/common';
import { LoginRequestDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { BaseController } from 'src/vendors/base';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { Cookies } from 'src/vendors/decorators/cookies.decorator';
import { ResetPasswordDto } from './dto/reset-password-dto';

@Controller('auth')
@UseGuards(AuthGuard)
export class AuthController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  @ApiTags('Auth')
  @Post('login')
  @ApiOperation({
    summary: 'Login account',
    description: 'Login user account with email and password',
  })
  @ApiResponse({
    status: 201,
    description: 'Success',
    headers: { 'Set-Cookie': { description: 'Set refresh token for user' } },
  })
  @Recaptcha()
  async login(
    @Body() loginUserDto: LoginRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(loginUserDto);
    response.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    return this.response({ accessToken: token.accessToken });
  }

  @Put('change-password')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change user account password',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  @IsForceLogin(true)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.authService.changePassword(changePasswordDto, user),
    );
  }

  @Post('forget-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Generate and send reset password email',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.response(
      await this.authService.forgetPassword(forgetPasswordDto),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Refresh token using refreshToken cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  async refresh(@Cookies('refreshToken') refreshToken: string) {
    return this.response(await this.authService.refreshToken(refreshToken));
  }


  @Put('reset-password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using a reset token in the header',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(
    @Headers('authorization') authHeader: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {


    return this.response(
      await this.authService.resetPassword(authHeader, resetPasswordDto),
    );
  }
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
