import { Injectable } from '@nestjs/common';
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

  async transfer(external: ExternalDto) {
    const { data } = external;
    const rawData = await this.encryptionService.decrypt(data);
    const jsonData = await JSON.parse(rawData);
    console.log(jsonData);
    return jsonData;
  }

  async getBanks() {
    return await this.bankModel.find();
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
