import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/schemas/account.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { HttpModule } from '@nestjs/axios';
import { Bank, BankSchema } from 'src/schemas/bank.schema';
import { EncryptionModule } from 'src/services/encryption/encryption.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Account.name, schema: AccountSchema },
        { name: User.name, schema: UserSchema },
        { name: Bank.name, schema: BankSchema },
      ],
      'users',
    ),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    EncryptionModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
