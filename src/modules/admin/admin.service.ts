import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { Bank, BankDocument } from 'src/schemas/bank.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuccessMessage } from 'src/common/messages';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Bank.name, 'users') private bankModel: Model<BankDocument>,
  ) {}

  async registerBank(createBankDto: CreateBankDto) {
    const bank = new this.bankModel(createBankDto);
    await bank.save();
    return SuccessMessage.SUCCESS;
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
