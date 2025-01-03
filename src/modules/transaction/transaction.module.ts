import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/schemas/account.schema';
import { Receiver, ReceiverSchema } from 'src/schemas/receiver.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';
import { OTP, OTPSchema } from 'src/schemas/otp.schema';
import { MailModule } from 'src/services/mail/mail.module';
import { Remind, RemindSchema } from 'src/schemas/remind.schema';
import { ReceiverModule } from '../receiver/receiver.module';
import { Bank, BankSchema } from 'src/schemas/bank.schema';
import { AccountModule } from '../account/account.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: Receiver.name, schema: ReceiverSchema },
        { name: Account.name, schema: AccountSchema },
        { name: Transaction.name, schema: TransactionSchema },
        { name: OTP.name, schema: OTPSchema },
        { name: Remind.name, schema: RemindSchema },
        { name: Bank.name, schema: BankSchema },
      ],
      'users',
    ),
    ReceiverModule,
    MailModule,
    AccountModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
