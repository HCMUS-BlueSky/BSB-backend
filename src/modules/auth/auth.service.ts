import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDto, RegisterRequestDto } from './dto/auth.dto';
import { ROLES } from 'src/common/constants';
import { JwtService } from '@nestjs/jwt';
import { compareSync, genSalt, hash } from 'bcrypt';
import { ErrorMessage, SuccessMessage } from 'src/common/messages';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/services/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password-dto';

// import { MailService } from '../../../services/mail/mail.service';
// import { UserDto } from '../user/dto/user.dto';
// import { uuid } from 'uuidv4';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    // private readonly mailService: MailService,
    // private readonly authRedisService: AuthRedis,
    private readonly mailService: MailService,

    @InjectModel(User.name, 'users')
    private userModel: Model<UserDocument>,
  ) {}

  async register(data: RegisterRequestDto) {
    //check email exist
    const user = await this.userService.findOneByEmail(data.email);
    if (user) {
      throw new BadRequestException(ErrorMessage.USER_EXISTED);
    }
    const salt = await genSalt(10);
    const hashPassword = await hash(data.password, salt);
    const newUser = {
      ...data,
      password: hashPassword,
      role: ROLES.CUSTOMER,
    };
    await this.userService.createUser(newUser);
    return SuccessMessage.SUCCESS;
  }

  // async sendVerifyCode(user: UserEntity, token: string) {
  //   await this.mailService.sendUserConfirmation(user, token);
  // }

  // async sendForgotPwdEmail(user: UserEntity, token: string) {
  //   await this.mailService.sendResetPwd(user, token);
  // }

  // async confirmVerifyCode(token: string) {
  //   let decoded;
  //   try {
  //     decoded = this.jwtService.verify(token, {
  //       secret: process.env.JWT_VALIDATE_ACCOUNT_KEY,
  //     });
  //   } catch {
  //     throw new BadRequestException(ErrorMessage.EXPIRED_TOKEN);
  //   }
  //   const findUser = await this.userService.findOneByEmail(decoded.email);
  //   if (!findUser) {
  //     throw new BadRequestException(ErrorMessage.INVALID_USER);
  //   }
  //   if (findUser.isValidate) {
  //     throw new BadRequestException(ErrorMessage.VALIDATED_ACCOUNT);
  //   }
  //   await this.userService.updateUserByEmail(decoded.email, {
  //     isValidate: true,
  //   });

  //   //generate token
  //   const jwtid = uuid();
  //   const auth = await this.createAuthToken({
  //     id: findUser.id,
  //     role: findUser.role,
  //     jwtid,
  //   });
  //   await this.authRedisService.setTokenByUser(auth, jwtid);
  //   return {
  //     user: {
  //       name: findUser?.name,
  //       role: findUser?.role,
  //     },
  //     auth,
  //   };
  // }

  validateToken(token: string) {
    try {
      const { id, role } = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_KEY'),
      });
      return {
        id,
        role,
      };
    } catch {
      throw new UnauthorizedException(ErrorMessage.EXPIRED_TOKEN);
    }
  }

  async login(data: LoginRequestDto) {
    //check email exist
    const user = await this.userService.findOneByEmail(data.email);
    if (!user) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    //compare pwd
    await this.comparePassword(data.password, user.password);

    const auth = this.createAuthToken({
      id: user.id,
      role: user.role,
    });
    return auth;
  }

  async comparePassword(password: string, authPassword: string) {
    const checkPassword = compareSync(password, authPassword);
    if (!checkPassword) {
      throw new BadRequestException(ErrorMessage.WRONG_PASSWORD);
    }
  }

  private createAuthToken(data: any) {
    const { accessToken } = this.generateAccessToken(data);
    const { refreshToken } = this.generateRefreshToken(data);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_KEY'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_KEY_EXPIRE'),
    });
    return { accessToken };
  }

  private generateRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_KEY'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_KEY_EXPIRE'),
    });
    return { refreshToken };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: any,
  ): Promise<void> {
    const { oldPassword, newPassword } = changePasswordDto;
    const account = await this.userModel.findById(user.id).populate('account');

    if (!account) {
      throw new BadRequestException(ErrorMessage.ACCOUNT_NOT_EXIST);
    }

    //compare pwd
    await this.comparePassword(oldPassword, account.password);

    account.password = await hash(newPassword, 10);
    await account.save();
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    const { email } = forgetPasswordDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException(ErrorMessage.EMAIL_NOT_ASSOCIATED);
    }

    const { accessToken } = this.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const resetPasswordUrl = `${this.configService.get<string>('FRONTEND_BASE_URL')}/reset-password?token=${accessToken}`;

    await this.mailService.sendForgetPasswordEmail(resetPasswordUrl, user);
  }

  async refreshToken(token: string) {
    try {
      const { id } = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_KEY'),
      });

      const user = await this.userService.findOneById(id);
      if (!user) {
        throw new BadRequestException(ErrorMessage.INVALID_USER);
      }

      const { accessToken } = this.generateAccessToken({
        id: user.id,
        role: user.role,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException(ErrorMessage.EXPIRED_TOKEN);
    }
  }

  async resetPassword(authHeader: string, resetPasswordDto: ResetPasswordDto): Promise<any> {

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException(ErrorMessage.HEADER_FAILURE);
    }
    const token = authHeader.replace('Bearer ', '');
  
    
    const { newPassword } = resetPasswordDto;
  
    let decodedToken;
    try {
      decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_KEY'),
      });
    } catch {
      throw new BadRequestException(ErrorMessage.EXPIRED_TOKEN);
    }
  
    const user = await this.userModel.findById(decodedToken.id);
    if (!user) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
  
    const salt = await genSalt(10);
    const hashedPassword = await hash(newPassword, salt);
  
    user.password = hashedPassword;
    await user.save();
  }
  
  // private generateResetPasswordToken(payload: any) {
  //   const resetPasswordToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_RESET_PASSWORD_KEY,
  //     expiresIn: process.env.JWT_RESET_PASSWORD_KEY_EXPIRE,
  //   });
  //   return { resetPasswordToken };
  // }

  // private generateValidateAccountToken(payload: any) {
  //   const validateToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_VALIDATE_ACCOUNT_KEY,
  //     expiresIn: process.env.JWT_VALIDATE_ACCOUNT_KEY_EXPIRE,
  //   });
  //   return { validateToken };
  // }

  //send email to validate account
  // async sendValidate(email: string) {
  //   const authUser = await this.userService.findOneByEmail(email);
  //   if (!authUser) {
  //     throw new BadRequestException(ErrorMessage.INVALID_USER);
  //   }
  //   if (authUser.isValidate) {
  //     throw new BadRequestException(ErrorMessage.VALIDATED_ACCOUNT);
  //   }
  //   const { validateToken } = this.generateValidateAccountToken({
  //     email: email,
  //   });
  //   this.sendVerifyCode(authUser, validateToken);
  //   return true;
  // }

  //send email to reset pwd
  // async sendResetPassword(email: string) {
  //   const authUser = await this.userService.findOneByEmail(email);
  //   if (!authUser) {
  //     throw new BadRequestException(ErrorMessage.INVALID_USER);
  //   }
  //   const { resetPasswordToken } = this.generateResetPasswordToken({
  //     email: email,
  //   });
  //   this.sendForgotPwdEmail(authUser, resetPasswordToken);
  //   return true;
  // }
  // login -> access + refresh
  //logout -> give both token in blacklist
  // validate -> find token in blacklist -> reject
  // async refreshToken(token: string) {
  //   try {
  //     const { id, role, jwtid } = await this.jwtService.verify(token, {
  //       secret: process.env.JWT_REFRESH_KEY,
  //     });
  //     //check if it exist in redis
  //     const storeToken = await this.authRedisService.getTokenByUser(jwtid);
  //     if (!storeToken || storeToken?.refreshToken != token) {
  //       throw new UnauthorizedException();
  //     }
  //     let user: any;
  //     if (role == ROLES.ADMIN || role == ROLES.USER) {
  //       user = await this.userService.findOneById(id);
  //     } else if (role == ROLES.SUPER_ADMIN) {
  //       user = await this.userService.findAdminById(id);
  //     }
  //     const { refreshToken, accessToken } = storeToken;
  //     try {
  //       await this.jwtService.verifyAsync(accessToken, {
  //         secret: process.env.JWT_ACCESS_KEY,
  //       });
  //     } catch (error) {
  //       //refresh not expire, but access expired
  //       const { accessToken: newAccessToken } = this.generateAccessToken({
  //         id,
  //         role,
  //         jwtid,
  //       });
  //       //save into redis
  //       await this.authRedisService.setTokenByUser(
  //         { accessToken: newAccessToken, refreshToken },
  //         jwtid,
  //       );
  //       return {
  //         accessToken: newAccessToken,
  //         refreshToken: token,
  //         user: {
  //           id: user.id,
  //           name: user.name,
  //           email: user.email,
  //           birthdate: user?.birthdate,
  //           role: user?.role ?? ROLES.SUPER_ADMIN,
  //         },
  //       };
  //     }

  //     return {
  //       accessToken: accessToken,
  //       refreshToken: refreshToken,
  //       user: {
  //         id: user.id,
  //         name: user.name,
  //         email: user.email,
  //         birthdate: user?.birthdate,
  //         role: user?.role ?? ROLES.SUPER_ADMIN,
  //       },
  //     };
  //   } catch (err) {
  //     throw new UnauthorizedException(ErrorMessage.EXPIRED_TOKEN);
  //   }
  // }

  // async logout(user: any) {
  //   await this.authRedisService.delTokenByUser(user.key);
  //   await this.userService.updateUserById(user.id, { lastActive: new Date() });
  //   return true;
  // }

  // async resetPassword(data: ResetPwdDto) {
  //   const { token, password } = data;
  //   let decoded;
  //   try {
  //     decoded = this.jwtService.verify(token, {
  //       secret: process.env.JWT_RESET_PASSWORD_KEY,
  //     });
  //   } catch {
  //     throw new BadRequestException(ErrorMessage.EXPIRED_TOKEN);
  //   }
  //   const findUser = await this.userService.findOneByEmail(decoded.email);
  //   if (!findUser) {
  //     throw new BadRequestException(ErrorMessage.INVALID_USER);
  //   }
  //   const salt = await genSalt(10);
  //   const hashPassword = await hash(password, salt);
  //   await this.userService.updateUserByEmail(decoded.email, {
  //     password: hashPassword,
  //   });
  //   return true;
  // }
}
