import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { ReceiverModule } from './modules/receiver/receiver.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      connectionName: 'users',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URL'),
      }),
    }),
    GoogleRecaptchaModule.forRoot({
      debug: true,
      secretKey: process.env.RECAPTCHA_SECRET_KEY, // Lấy từ .env
      response: (req) => req.headers.recaptcha,
    }),
    AccountModule,
    UserModule,
    AuthModule,
    ReceiverModule,
    TransactionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
