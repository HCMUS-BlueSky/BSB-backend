import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailToken, EmailTokenSchema } from 'src/schemas/email-token.schema';
import { ResetToken, ResetTokenSchema } from 'src/schemas/reset-token.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: EmailToken.name, schema: EmailTokenSchema },
        { name: ResetToken.name, schema: ResetTokenSchema },
      ],
      'users',
    ),
    AccountModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
