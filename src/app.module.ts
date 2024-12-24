import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { ReceiverModule } from './modules/receiver/receiver.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { RemindModule } from './modules/remind/remind.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationModule } from './modules/notification/notification.module';

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
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secretKey: config.get<string>('RECAPTCHA_SECRET_KEY'),
        response: (req) => req.headers.recaptcha,
      }),
    }),
    AccountModule,
    UserModule,
    AuthModule,
    ReceiverModule,
    TransactionModule,
    RemindModule,
    EmployeeModule,
    AdminModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
