import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { Bank, BankDocument } from 'src/schemas/bank.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuccessMessage } from 'src/common/messages';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transaction.schema';
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from 'src/common/constants';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Bank.name, 'users') private bankModel: Model<BankDocument>,
    @InjectModel(Transaction.name, 'users')
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async registerBank(createBankDto: CreateBankDto) {
    const bank = new this.bankModel(createBankDto);
    await bank.save();
    return SuccessMessage.SUCCESS;
  }

  async getExternalTransactions(limit: number) {
    const transactions = await this.transactionModel
      .find({
        status: TRANSACTION_STATUS.FULFILLED,
        updatedAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - limit)),
        },
        type: TRANSACTION_TYPE.EXTERNAL,
      })
      .populate({
        path: 'receiver',
        select: 'accountNumber',
        populate: [
          { path: 'owner', select: 'fullName -_id' },
          { path: 'bank', select: 'name logo' },
        ],
      })
      .populate({
        path: 'sender',
        select: 'accountNumber',
        populate: [
          { path: 'owner', select: 'fullName -_id' },
          { path: 'bank', select: 'name logo' },
        ],
      })
      .populate('bank', 'name logo');
    return transactions;
  }
  // create(createAdminDto: CreateAdminDto) {
  //   return 'This action adds a new admin';
  // }

  // findAll() {
  //   return `This action returns all admin`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} admin`;
  // }

  // update(id: number, updateAdminDto: UpdateAdminDto) {
  //   return `This action updates a #${id} admin`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} admin`;
  // }
}
