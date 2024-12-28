import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/schemas/account.schema';
import { ACCOUNT_TYPE } from 'src/common/constants';
import { AccountInfoDto } from './dto/account-info.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class AccountService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Account.name, 'users')
    private accountModel: Model<AccountDocument>,
    @InjectModel(User.name, 'users')
    private userModel: Model<UserDocument>,
  ) {}
  // async findOneByEmail(email: string) {
  //   return await this.userModel.findOne({ email: email });
  // }
  async createAccountForUser(userId: string) {
    const accountNumber = this.generateBankAccountNumber();
    const data = {
      owner: userId,
      accountNumber,
      balance: 0,
    };
    const account = new this.accountModel(data);
    return await account.save();
  }

  generateBankAccountNumber() {
    let accountNumber = '';
    for (let i = 0; i < 20; i++) {
      accountNumber += Math.floor(Math.random() * 10);
    }
    return accountNumber;
  }
  async getAccount(user: any) {
    return await this.accountModel.findOne({
      owner: user.id,
      type: ACCOUNT_TYPE.INTERNAL,
    });
  }
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  // findAll() {
  //   return `This action returns all user`;
  // }

  async getUserInfoByAccountNumber(accountNumber: string) {
    const account = await this.accountModel
      .findOne({
        accountNumber: accountNumber,
        type: ACCOUNT_TYPE.INTERNAL,
      })
      .populate('owner', 'email fullName phone')
      .select('owner');
    return account.owner;
  }

  async getUserInfoByAccountNumberOrEmail(accountInfoDto: AccountInfoDto) {
    const { accountNumberOrEmail } = accountInfoDto;
    const account = await this.accountModel
      .findOne({
        accountNumber: accountNumberOrEmail,
        type: ACCOUNT_TYPE.INTERNAL,
      })
      .populate('owner', 'email fullName phone')
      .select('owner');
    if (account) return account.owner;

    const user = await this.userModel
      .findOne({
        email: accountNumberOrEmail,
      })
      .select('email fullName phone');
    return user;
  }
  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
