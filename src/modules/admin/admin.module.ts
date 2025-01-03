import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from 'src/schemas/bank.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Bank.name, schema: BankSchema },
        { name: Transaction.name, schema: TransactionSchema },
      ],
      'users',
    ),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
