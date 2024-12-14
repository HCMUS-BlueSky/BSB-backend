import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
// import { MailModule } from 'src/services/mail/mail.module';
import { AccountModule } from '../account/account.module';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [
    JwtModule,
    // MailModule,
    AccountModule,
    UserModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
