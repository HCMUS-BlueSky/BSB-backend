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
import { EncryptionModule } from 'src/services/encryption/encryption.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: Receiver.name, schema: ReceiverSchema },
        { name: Account.name, schema: AccountSchema },
        { name: Transaction.name, schema: TransactionSchema },
        { name: OTP.name, schema: OTPSchema },
      ],
      'users',
    ),
    MailModule,
    EncryptionModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
