import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from 'src/modules/jwt/jwt.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MailModule } from 'src/services/mail/mail.module';
import { EmailToken, EmailTokenSchema } from 'src/schemas/email-token.schema';
import { ResetToken, ResetTokenSchema } from 'src/schemas/reset-token.schema';

@Module({
  imports: [
    JwtModule,
    MailModule,
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: EmailToken.name, schema: EmailTokenSchema },
        { name: ResetToken.name, schema: ResetTokenSchema },
      ],
      'users',
    ),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
