import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OTPDocument } from 'src/schemas/otp.schema';
import { UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendTransactionOTP(otp: OTPDocument, user: UserDocument) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'BSB | Transaction OTP',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        email: user.email,
        fullName: user.fullName,
        otp: otp.otp,
      },
    });
  }

  async sendForgetPasswordEmail( resetPasswordUrl: string,user: UserDocument) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'BSB | Password Reset Request',
      template: './forget-password',
      context: {
        fullName:user.fullName,
        resetPasswordUrl,
      },
    });
  }

  // async sendResetPwd(user: UserEntity, token: string) {
  //   const url = `${process.env.URL}/auth/reset-password?token=${token}`;

  //   await this.mailerService.sendMail({
  //     to: user.email,
  //     // from: '"Support Team" <support@example.com>', // override default from
  //     subject: 'An toan so || Reset password',
  //     template: './reset-password', // `.hbs` extension is appended automatically
  //     context: { // ✏️ filling curly brackets with content
  //       name: user.name || user.email,
  //       url,
  //     },
  //   });
  // }
}
