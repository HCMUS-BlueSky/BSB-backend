import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/schemas/account.schema';
import { ACCOUNT_TYPE, BANK_TYPE } from 'src/common/constants';
import { AccountInfoDto } from './dto/account-info.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import { HttpService } from '@nestjs/axios';
import { Bank, BankDocument } from 'src/schemas/bank.schema';
import { ErrorMessage } from 'src/common/messages';
import crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AccountService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Account.name, 'users')
    private accountModel: Model<AccountDocument>,
    @InjectModel(User.name, 'users')
    private userModel: Model<UserDocument>,
    @InjectModel(Bank.name, 'users')
    private bankModel: Model<BankDocument>,
    private readonly httpService: HttpService,
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

  async getExternalAccountInfo(accountNumber: string, bankId: string) {
    const bank = await this.bankModel.findById(bankId);
    if (!bank) {
      throw new BadRequestException(ErrorMessage.BANK_IS_NOT_REGISTERED);
    }
    const { baseUrl, publicKeyPath, accountInfoPath, secretKey, type } = bank;
    if (type === BANK_TYPE.PGP) {
      throw new BadRequestException(ErrorMessage.NOT_IMPLEMENTED);
    }
    const publicKeyRaw = await firstValueFrom(
      this.httpService.get(baseUrl + publicKeyPath),
    );
    const publicKey = publicKeyRaw.data.data;
    console.log(publicKey);
    // TODO: ENCRYPT accountNumber WITH publicKey
    const encrypted = '';
    const body = {
      data: encrypted,
    };
    const info = await firstValueFrom(
      this.httpService.post(
        baseUrl + accountInfoPath,
        {
          mode: 'no-cors',
          body: body,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Signature: crypto
              .createHash('md5')
              .update(JSON.stringify(body) + secretKey)
              .digest('hex'),
            RequestDate: new Date().getTime(),
          },
        },
      ),
    );
    return info.data.data;
    // return await this.accountModel.findOne({
    //   owner: user.id,
    //   type: ACCOUNT_TYPE.INTERNAL,
    // });
  }
  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
