import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AccountModule } from '../account/account.module';
import { AuthModule } from '../auth/auth.module';
import { Account, AccountSchema } from 'src/schemas/account.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: Account.name, schema: AccountSchema },
        { name: Transaction.name, schema: TransactionSchema },
      ],
      'users',
    ),
    AuthModule,
    AccountModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
