import { Module } from '@nestjs/common';
import { ExternalService } from './external.service';
import { ExternalController } from './external.controller';
import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { AccountModule } from '../account/account.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from 'src/schemas/bank.schema';
import { Account, AccountSchema } from 'src/schemas/account.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: Account.name, schema: AccountSchema },
        { name: Transaction.name, schema: TransactionSchema },
        { name: Bank.name, schema: BankSchema },
      ],
      'users',
    ),
    EncryptionModule,
    AccountModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ExternalController],
  providers: [ExternalService],
  exports: [ExternalService],
})
export class ExternalModule {}
