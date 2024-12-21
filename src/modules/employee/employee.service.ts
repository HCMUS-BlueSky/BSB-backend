import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TopUpAccountDto } from './dto/topup-account.dto';
import { Account, AccountDocument } from 'src/schemas/account.schema';
import { ErrorMessage, SuccessMessage } from 'src/common/messages';
import { AccountHistoryDto } from './dto/account-history.dto';
import { TRANSACTION_STATUS } from 'src/common/constants';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transaction.schema';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Account.name, 'users')
    private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name, 'users')
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async topUpAccount(topUpAccountDto: TopUpAccountDto) {
    const { amount, accountNumber } = topUpAccountDto;
    const associatedAccount = await this.accountModel.findOne({
      accountNumber,
    });
    if (!associatedAccount) {
      throw new BadRequestException(ErrorMessage.ACCOUNT_NOT_EXIST);
    }
    await this.accountModel.findOneAndUpdate(
      { accountNumber },
      { $inc: { balance: amount } },
    );
    return SuccessMessage.SUCCESS;
  }

  async getAccountHistory(accountHistoryDto: AccountHistoryDto) {
    const { accountNumber } = accountHistoryDto;
    const associatedAccount = await this.accountModel.findOne({
      accountNumber,
    });
    if (!associatedAccount) {
      throw new BadRequestException(ErrorMessage.ACCOUNT_NOT_EXIST);
    }
    const transactions = await this.transactionModel
      .find({
        $or: [
          { sender: associatedAccount._id },
          { receiver: associatedAccount.id },
        ],
        status: TRANSACTION_STATUS.FULFILLED,
      })
      .populate({
        path: 'receiver',
        select: 'accountNumber',
        populate: { path: 'owner', select: 'fullName -_id' },
      })
      .populate({
        path: 'sender',
        select: 'accountNumber',
        populate: { path: 'owner', select: 'fullName -_id' },
      });
    return transactions;
  }
}
