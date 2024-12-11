import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
// import { MailModule } from 'src/services/mail/mail.module';
import { UserService } from '../user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailToken, EmailTokenSchema } from 'src/schemas/email-token.schema';
import { ResetToken, ResetTokenSchema } from 'src/schemas/reset-token.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Global()
@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: EmailToken.name, schema: EmailTokenSchema },
        { name: ResetToken.name, schema: ResetTokenSchema },
      ],
      'users',
    ),
    // MailModule,
  ],
  providers: [AuthService, UserService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
