import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TopUpAccountDto } from './dto/topup-account.dto';
import { Account, AccountDocument } from 'src/schemas/account.schema';
import { ErrorMessage, SuccessMessage } from 'src/common/messages';
import { AccountHistoryDto } from './dto/account-history.dto';
import { ACCOUNT_TYPE, ROLES, TRANSACTION_STATUS } from 'src/common/constants';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transaction.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { genSalt, hash } from 'bcrypt';
import { RegisterRequestDto } from '../auth/dto/auth.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly userService: UserService,
    @InjectModel(Account.name, 'users')
    private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name, 'users')
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(User.name, 'users') private userModel: Model<UserDocument>,
  ) {}

  async topUpAccount(topUpAccountDto: TopUpAccountDto) {
    const { amount, accountNumberOrEmail } = topUpAccountDto;
    let accountNumber = '';
    const associatedAccount = await this.accountModel.findOne({
      accountNumber: accountNumberOrEmail,
      type: ACCOUNT_TYPE.INTERNAL,
    });
    if (associatedAccount) {
      accountNumber = associatedAccount.accountNumber;
    } else {
      const associatedUser = await this.userModel
        .findOne({
          email: accountNumberOrEmail,
        })
        .populate('account');
      if (!associatedUser) {
        throw new BadRequestException(ErrorMessage.ACCOUNT_NOT_EXIST);
      }
      const account = associatedUser.account as AccountDocument;
      if (!account) {
        throw new BadRequestException(ErrorMessage.ACCOUNT_NOT_EXIST);
      }
      accountNumber = account.accountNumber;
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
      type: ACCOUNT_TYPE.INTERNAL,
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

  async getAccountList() {
    const accounts = await this.accountModel
      .find({
        type: ACCOUNT_TYPE.INTERNAL,
      })
      .populate({
        path: 'owner',
        select: '-password -receiverList',
        match: { role: 'CUSTOMER' },
      });
    return accounts.filter((account) => account.owner);
  }

  async getAccountById(id: string) {
    const account = await this.accountModel
      .findOne({
        _id: id,
        type: ACCOUNT_TYPE.INTERNAL,
      })
      .populate({
        path: 'owner',
        select: '-password -receiverList',
        match: { role: 'CUSTOMER' },
      });
    if (!account.owner) {
      throw new BadRequestException(ErrorMessage.ACCOUNT_NOT_EXIST);
    }
    return account;
  }

  async getAllEmployee() {
    const employees = await this.userModel
      .find({
        role: ROLES.EMPLOYEE,
      })
      .select('-password -receiverList -account');
    return employees;
  }

  async update(id: string, updateAdminDto: any) {
    const { fullName, phone, address, dob } = updateAdminDto;
    const dataToUpdate = {};
    if (fullName) {
      dataToUpdate['fullName'] = fullName;
    }
    if (phone) {
      dataToUpdate['phone'] = phone;
    }
    if (address) {
      dataToUpdate['address'] = address;
    }
    if (dob) {
      dataToUpdate['dob'] = dob;
    }
    const existed = await this.userModel.exists({
      _id: id,
      role: ROLES.EMPLOYEE,
    });
    if (!existed) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    await this.userModel.findByIdAndUpdate(id, dataToUpdate);
    return SuccessMessage.SUCCESS;
  }

  async remove(id: string) {
    const existed = await this.userModel.exists({
      _id: id,
      role: ROLES.EMPLOYEE,
    });
    if (!existed) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    await this.userModel.findOneAndDelete({
      _id: id,
      role: ROLES.EMPLOYEE,
    });
    return SuccessMessage.SUCCESS;
  }

  async register(data: RegisterRequestDto) {
    //check email exist
    const user = await this.userService.findOneByEmail(data.email);
    if (user) {
      throw new BadRequestException(ErrorMessage.USER_EXISTED);
    }
    const salt = await genSalt(10);
    const hashPassword = await hash(data.password, salt);
    const newUser = {
      ...data,
      password: hashPassword,
      role: ROLES.EMPLOYEE,
    };
    await this.userService.createUser(newUser);
    return SuccessMessage.SUCCESS;
  }
}
