import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginResponseDto,
  LoginUserDto,
  RegisterUserDto,
  ResendEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
// import { JwtService } from 'src/modules/jwt/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
// import { isValidObjectId, Model, Types } from 'mongoose';
// import * as bcrypt from 'bcrypt';
// import { I18nContext, I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
// import { MailService } from 'src/services/mail/mail.service';
// import { randomUUID } from 'crypto';
import { EmailToken, EmailTokenDocument } from 'src/schemas/email-token.schema';
import { ResetToken, ResetTokenDocument } from 'src/schemas/reset-token.schema';

@Injectable()
export class AuthService {
  constructor(
    // private readonly jwtService: JwtService,
    // private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    // private readonly mailService: MailService,
    @InjectModel(User.name, 'users') private userModel: Model<UserDocument>,
    @InjectModel(EmailToken.name, 'users')
    private emailTokenModel: Model<EmailTokenDocument>,
    @InjectModel(ResetToken.name, 'users')
    private resetTokenModel: Model<ResetTokenDocument>,
  ) {}

  // async register(body: RegisterUserDto): Promise<string> {
  //   const existed = await this.userModel.exists({ email: body.email });
  //   if (existed) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorUserExisted', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const newUser = new this.userModel(body);
  //   newUser.password = await bcrypt.hash(newUser.password, 10);
  //   await newUser.save();
  //   const token = randomUUID();
  //   const verifyToken = new this.emailTokenModel({
  //     owner: newUser._id,
  //     token: token,
  //   });
  //   await verifyToken.save();
  //   this.mailService.sendUserConfirmation(newUser, verifyToken);

  //   return this.i18n.t('common.SuccessUserRegistered', {
  //     lang: I18nContext.current().lang,
  //   });
  // }

  // async login(body: LoginUserDto): Promise<LoginResponseDto> {
  //   const user = await this.userModel.findOne({ email: body.email });
  //   if (!user) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorLogin', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const passwordHash = user.password;
  //   const isMatch = await bcrypt.compare(body.password, passwordHash);
  //   if (!isMatch) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorLogin', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const isVerified = user.verified;
  //   if (!isVerified) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorNotVerified', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const dt = new Date();
  //   const iat = Math.floor(dt.getTime() / 1000);
  //   const exp = Math.floor(
  //     new Date(
  //       dt.getTime() +
  //         (this.configService.get<number>('TOKEN_TTL') || 86400) * 1000,
  //     ).valueOf() / 1000,
  //   );
  //   const claims = {
  //     id: user.id,
  //     iat,
  //     exp,
  //   };
  //   const token = await this.jwtService.sign(claims);

  //   return {
  //     token,
  //     message: this.i18n.t('common.SuccessLogin', {
  //       lang: I18nContext.current().lang,
  //     }),
  //   };
  // }

  // async confirm(body: VerifyEmailDto): Promise<string> {
  //   const { id, token } = body;
  //   if (!isValidObjectId(id)) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorInvalidToken', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const userToken = await this.emailTokenModel.findOne({
  //     owner: new Types.ObjectId(id),
  //     token: token,
  //   });
  //   if (!userToken) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorInvalidToken', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const unverifedUser = await this.userModel.findOne({
  //     _id: id,
  //     verified: false,
  //   });
  //   if (!unverifedUser) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorAlreadyVerify', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const yesterday = new Date(new Date().valueOf() - 24 * 60 * 60 * 1000);
  //   if (userToken.createdAt < yesterday) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorInvalidToken', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   await this.userModel.findByIdAndUpdate(id, { verified: true });
  //   return this.i18n.t('common.SuccessEmailVerify', {
  //     lang: I18nContext.current().lang,
  //   });
  // }

  // async resend(body: ResendEmailDto): Promise<string> {
  //   const user = await this.userModel.findOne({
  //     email: body.email,
  //     verified: false,
  //   });
  //   if (!user) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorUserNotExistOrAlreadyVerify', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const previousToken = await this.emailTokenModel.findOne({
  //     owner: user._id,
  //   });
  //   const token = randomUUID();
  //   let newToken = new this.emailTokenModel({
  //     owner: user._id,
  //     token: token,
  //   });
  //   if (!previousToken) {
  //     await newToken.save();
  //   } else {
  //     const yesterday = new Date(new Date().valueOf() - 24 * 60 * 60 * 1000);
  //     if (previousToken.createdAt < yesterday) {
  //       await this.emailTokenModel.findByIdAndDelete(previousToken._id);
  //       await newToken.save();
  //     } else {
  //       newToken = previousToken;
  //     }
  //   }
  //   this.mailService.sendUserConfirmation(user, newToken);
  //   return this.i18n.t('common.SuccessEmailResend', {
  //     lang: I18nContext.current().lang,
  //   });
  // }

  // async forgotPassword(body: ForgotPasswordDto) {
  //   const user = await this.userModel.findOne({
  //     email: body.email,
  //     verified: true,
  //   });
  //   if (!user) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorUserNotExistOrNotVerify', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const previousToken = await this.resetTokenModel.findOne({
  //     owner: user._id,
  //   });
  //   const token = randomUUID();
  //   let newToken = new this.resetTokenModel({
  //     owner: user._id,
  //     token: token,
  //   });
  //   if (!previousToken) {
  //     await newToken.save();
  //   } else {
  //     const yesterday = new Date(new Date().valueOf() - 24 * 60 * 60 * 1000);
  //     if (previousToken.createdAt < yesterday) {
  //       await this.resetTokenModel.findByIdAndDelete(previousToken._id);
  //       await newToken.save();
  //     } else {
  //       newToken = previousToken;
  //     }
  //   }
  //   this.mailService.sendResetPassword(user, newToken);
  //   return this.i18n.t('common.SuccessResetPasswordSend', {
  //     lang: I18nContext.current().lang,
  //   });
  // }

  // async resetPassword(body: ResetPasswordDto) {
  //   const { id, token, new_password, confirm_password } = body;
  //   if (new_password !== confirm_password) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorConfirmPasswordNotMatch', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   if (!isValidObjectId(id)) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorInvalidToken', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const resetToken = await this.resetTokenModel.findOne({
  //     owner: new Types.ObjectId(id),
  //     token: token,
  //   });
  //   if (!resetToken) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorInvalidToken', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const yesterday = new Date(new Date().valueOf() - 24 * 60 * 60 * 1000);
  //   if (resetToken.createdAt < yesterday) {
  //     throw new BadRequestException(
  //       this.i18n.t('common.ErrorInvalidToken', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }
  //   const new_hashed_password = await bcrypt.hash(new_password, 10);
  //   await this.userModel.findByIdAndUpdate(id, {
  //     password: new_hashed_password,
  //   });
  //   await this.resetTokenModel.findOneAndDelete({
  //     owner: new Types.ObjectId(id),
  //   });
  //   return this.i18n.t('common.SuccessResetPassword', {
  //     lang: I18nContext.current().lang,
  //   });
  // }
}
