import { BadRequestException, Injectable } from '@nestjs/common';
import { ExternalDto } from './dto/external.dto';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/schemas/account.schema';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transaction.schema';
import { Bank, BankDocument } from 'src/schemas/bank.schema';
import {
  ACCOUNT_TYPE,
  FEE,
  PAYER,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from 'src/common/constants';
import { ErrorMessage, SuccessMessage } from 'src/common/messages';

@Injectable()
export class ExternalService {
  constructor(
    private readonly encryptionService: EncryptionService,
    @InjectModel(Account.name, 'users')
    private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name, 'users')
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Bank.name, 'users')
    private bankModel: Model<BankDocument>,
  ) {}

  async transfer(external: ExternalDto, bank: any) {
    try {
      const { fromAccountNumber, toAccountNumber, amount, description, feePayer } =
        external;
      if (!fromAccountNumber || !toAccountNumber || !amount || !description) {
        throw new BadRequestException(ErrorMessage.INVALID_DATA);
      }
      const toAccount = await this.accountModel.findOne({
        accountNumber: toAccountNumber,
        type: ACCOUNT_TYPE.INTERNAL,
      });
      if (!toAccount) {
        throw new BadRequestException(ErrorMessage.INVALID_ACCOUNT_NUMBER);
      }

      let fromAccount = await this.accountModel.findOne({
        accountNumber: fromAccountNumber,
        type: ACCOUNT_TYPE.EXTERNAL,
        bank: bank.id,
      });

      if (!fromAccount) {
        fromAccount = new this.accountModel({
          accountNumber: fromAccountNumber,
          type: ACCOUNT_TYPE.EXTERNAL,
          bank: bank.id,
        });
        await fromAccount.save();
      }


      let fee = 0;
      if (feePayer == PAYER.RECEIVER) {
        fee = this.calculateFee(amount);
      }
      const amountToReceive = amount - fee;
      const newTransactionData = {
        sender: fromAccount._id,
        receiver: toAccount.id,
        amount: amount,
        description: description,
        status: TRANSACTION_STATUS.FULFILLED,
        type: TRANSACTION_TYPE.EXTERNAL,
        fee: fee,
        feePayer: feePayer,
        bank: bank.id
      };

      const newTransaction = new this.transactionModel(newTransactionData);
      await newTransaction.save();
      await this.accountModel.findOneAndUpdate(
        { accountNumber: toAccountNumber },
        { $inc: { balance: amountToReceive } },
      );
      return SuccessMessage.SUCCESS;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getBanks() {
    return await this.bankModel.find().select('name logo');
  }

  calculateFee(amount: number) {
    return Math.min(Math.round((amount * FEE.PERCENTAGE) / 100), FEE.MAX);
  }

  async getUserInfoByAccountNumber(accountNumber: string) {
    try {
      // console.log(accountNumber)
      const account = await this.accountModel
        .findOne({
          accountNumber: accountNumber,
          type: ACCOUNT_TYPE.INTERNAL,
        })
        .populate('owner', 'email fullName phone')
        .select('owner');
      return account.owner;
    } catch {
      throw new BadRequestException(ErrorMessage.INVALID_ACCOUNT_NUMBER);
    }
  }

  // findAll() {
  //   return `This action returns all external`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} external`;
  // }

  // update(id: number, updateExternalDto: UpdateExternalDto) {
  //   return `This action updates a #${id} external`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} external`;
  // }
}
