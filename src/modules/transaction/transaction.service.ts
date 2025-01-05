import * as mongoose from 'mongoose';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateInternalTransactionDto } from './dto/create-internal-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/schemas/account.schema';
import { Receiver, ReceiverDocument } from 'src/schemas/receiver.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transaction.schema';
import {
  ErrorMessage,
  GenericErrorMessage,
  SuccessMessage,
} from 'src/common/messages';
import {
  ACCOUNT_TYPE,
  BANK_TYPE,
  FEE,
  OTP_EXPIRED_TIME,
  PAYER,
  RECEIVER_TYPE,
  REMIND_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from 'src/common/constants';
import { OTP, OTPDocument } from 'src/schemas/otp.schema';
import { MailService } from 'src/services/mail/mail.service';
import { ConfirmInternalTransactionDto } from './dto/confirm-internal-transaction.dto';
import { ResendTransactionOTPDto } from './dto/resend-otp.dto';
import { Remind, RemindDocument } from 'src/schemas/remind.schema';
import { ReceiverService } from '../receiver/receiver.service';
import { CreateExternalTransactionDto } from './dto/create-external-transaction.dto';
import { Bank, BankDocument } from 'src/schemas/bank.schema';
import { AccountService } from '../account/account.service';
import { ConfirmExternalTransactionDto } from './dto/confirm-external-transaction.dto';
import { HttpService } from '@nestjs/axios';
import crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { EncryptionService } from 'src/services/encryption/encryption.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(User.name, 'users') private userModel: Model<UserDocument>,
    @InjectModel(Receiver.name, 'users')
    private receiverModel: Model<ReceiverDocument>,
    @InjectModel(Account.name, 'users')
    private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name, 'users')
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(OTP.name, 'users') private otpModel: Model<OTPDocument>,
    @InjectModel(Remind.name, 'users')
    private remindModel: Model<RemindDocument>,
    @InjectModel(Bank.name, 'users') private bankModel: Model<BankDocument>,
    private readonly mailService: MailService,
    private readonly receiverService: ReceiverService,
    private readonly accountService: AccountService,
    private readonly httpService: HttpService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async createInternalTransaction(
    createInternalTransactionDto: CreateInternalTransactionDto,
    user: any,
  ) {
    const currentUser = await this.userModel
      .findById(user.id)
      .populate('account');
    const currentAccount = currentUser.account as AccountDocument;
    const data = Object.assign({}, createInternalTransactionDto);
    if (data.accountNumber == currentAccount.accountNumber) {
      throw new BadRequestException(ErrorMessage.RECEIVER_IS_SAME);
    }
    const receiverAccount = await this.accountModel.findOne({
      accountNumber: data.accountNumber,
      type: ACCOUNT_TYPE.INTERNAL,
    });
    if (!receiverAccount) {
      throw new BadRequestException(ErrorMessage.RECEIVER_NOT_EXISTED);
    }
    if (currentAccount.status !== 'ACTIVE') {
      throw new BadRequestException(ErrorMessage.ACCOUNT_IS_DISABLED);
    }
    if (receiverAccount.status !== 'ACTIVE') {
      throw new BadRequestException(ErrorMessage.RECEIVER_IS_DISABLED);
    }
    await this.transactionModel.updateMany(
      {
        sender: currentAccount._id,
        status: TRANSACTION_STATUS.PENDING,
      },
      { status: TRANSACTION_STATUS.REJECTED },
    );
    // const onGoingTransaction = await this.transactionModel.exists({
    //   sender: currentAccount._id,
    //   status: TRANSACTION_STATUS.PENDING,
    // });
    // if (onGoingTransaction) {
    //   throw new BadRequestException(ErrorMessage.ON_GOING_TRANSACTION);
    // }
    if (currentAccount.balance < data.amount) {
      throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
    }
    const fee = this.calculateFee(data.amount);
    if (data.feePayer === PAYER.SENDER) {
      if (currentAccount.balance < data.amount + fee) {
        throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
      }
    }

    const newTransactionData = {
      sender: currentAccount._id,
      receiver: receiverAccount.id,
      amount: data.amount,
      description: data.description,
      fee: fee,
      feePayer: data.feePayer,
    };

    const newTransaction = new this.transactionModel(newTransactionData);
    const OTP = new this.otpModel({
      transaction: newTransaction.id,
      otp: this.genOTP(),
      expiry: new Date(+new Date() + OTP_EXPIRED_TIME)
    });
    await newTransaction.save();
    await OTP.save();
    await this.mailService.sendTransactionOTP(OTP, currentUser);

    if (data.saveAsReceiver) {
      try {
        await this.receiverService.create(
          {
            accountNumber: data.accountNumber,
            type: RECEIVER_TYPE.INTERNAL,
          },
          user,
        );
      } catch {}
    }
    return newTransaction;
  }

  calculateFee(amount: number) {
    return Math.min(Math.round((amount * FEE.PERCENTAGE) / 100), FEE.MAX);
  }

  genOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  async confirmInternalTransaction(
    confirmInternalTransaction: ConfirmInternalTransactionDto,
    user: any,
  ) {
    const { otp, transaction } = confirmInternalTransaction;
    const OTP = await this.otpModel
      .findOne({
        otp: otp,
        transaction: transaction,
      })
      .populate('transaction');
    if (!OTP) {
      throw new BadRequestException(ErrorMessage.INVALID_OTP);
    }
    if (OTP.expiry < new Date()) {
      throw new BadRequestException(ErrorMessage.OTP_EXPIRED);
    }
    const currentUser = await this.userModel
      .findById(user.id)
      .populate('account');
    const currentAccount = currentUser.account as AccountDocument;
    const transactionData = OTP.transaction as TransactionDocument;
    if (transactionData.status != TRANSACTION_STATUS.PENDING) {
      throw new BadRequestException(ErrorMessage.INVALID_TRANSACTION);
    }
    if (transactionData.sender != currentAccount.id) {
      throw new BadRequestException(ErrorMessage.INVALID_OTP);
    }

    const receiverAccount = await this.accountModel.findById(
      transactionData.receiver,
    );
    if (!receiverAccount) {
      throw new BadRequestException(ErrorMessage.RECEIVER_NOT_EXISTED);
    }
    if (currentAccount.status !== 'ACTIVE') {
      throw new BadRequestException(ErrorMessage.ACCOUNT_IS_DISABLED);
    }
    if (receiverAccount.status !== 'ACTIVE') {
      throw new BadRequestException(ErrorMessage.RECEIVER_IS_DISABLED);
    }

    if (currentAccount.balance < transactionData.amount) {
      throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
    }
    const fee = this.calculateFee(transactionData.amount);
    let amountToPay = 0,
      amountToReceive = 0;
    if (transactionData.feePayer === PAYER.SENDER) {
      if (currentAccount.balance < transactionData.amount + fee) {
        throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
      }
      amountToPay = transactionData.amount + fee;
      amountToReceive = transactionData.amount;
    } else if (transactionData.feePayer === PAYER.RECEIVER) {
      amountToPay = transactionData.amount;
      amountToReceive = transactionData.amount - fee;
    } else {
      return GenericErrorMessage.BAD_REQUEST;
    }
    await this.accountModel.findByIdAndUpdate(currentAccount.id, {
      $inc: { balance: -amountToPay },
    });
    await this.accountModel.findByIdAndUpdate(receiverAccount.id, {
      $inc: { balance: amountToReceive },
    });
    await this.transactionModel.findByIdAndUpdate(transactionData.id, {
      status: TRANSACTION_STATUS.FULFILLED,
    });
    await this.otpModel.findByIdAndDelete(OTP.id);
    return SuccessMessage.SUCCESS;
  }

  async getCurrentTransaction(user: any) {
    const currentAccount = await this.accountModel.findOne({ owner: user.id });
    if (!currentAccount) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    const transaction = await this.transactionModel
      .findOne({
        sender: currentAccount._id,
        status: TRANSACTION_STATUS.PENDING,
      })
      .populate({
        path: 'receiver',
        populate: {
          path: 'owner',
          select: 'email fullName phone',
        },
        select: 'accountNumber owner',
      });
    return transaction;
  }

  async resendTransactionOTP(
    resendTransactionOTPDTO: ResendTransactionOTPDto,
    user: any,
  ) {
    const { transaction } = resendTransactionOTPDTO;
    const currentUser = await this.userModel
      .findById(user.id)
      .populate('account');
    const currentAccount = currentUser.account as AccountDocument;
    if (!currentAccount) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    const transactionData = await this.transactionModel.exists({
      _id: transaction,
      sender: currentAccount._id,
      status: TRANSACTION_STATUS.PENDING,
    });
    if (!transactionData) {
      throw new BadRequestException(ErrorMessage.INVALID_TRANSACTION);
    }
    await this.otpModel.findOneAndDelete({
      transaction: transaction,
    });
    const OTP = new this.otpModel({
      transaction: transaction,
      otp: this.genOTP(),
      expiry: new Date(+new Date() + OTP_EXPIRED_TIME)
    });
    await OTP.save();
    await this.mailService.sendTransactionOTP(OTP, currentUser);
    return SuccessMessage.SUCCESS;
  }

  async remove(transactionID: string, user: any) {
    const currentAccount = await this.accountModel.findOne({ owner: user.id });
    if (!currentAccount) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    const transactionData = await this.transactionModel.exists({
      _id: transactionID,
      sender: currentAccount._id,
      status: TRANSACTION_STATUS.PENDING,
    });
    if (!transactionData) {
      throw new BadRequestException(ErrorMessage.INVALID_TRANSACTION);
    }
    await this.transactionModel.findByIdAndDelete(transactionID);
    return SuccessMessage.SUCCESS;
  }

  async getHistory(user: any, limit: number) {
    const currentAccount = await this.accountModel.findOne({ owner: user.id });
    if (!currentAccount) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    const transactions = await this.transactionModel
      .find({
        $or: [{ sender: currentAccount._id }, { receiver: currentAccount.id }],
        status: TRANSACTION_STATUS.FULFILLED,
        updatedAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - limit)),
        },
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
      });
    const reminders = await this.remindModel
      .find({
        $or: [{ from: currentAccount._id }, { to: currentAccount._id }],
        status: REMIND_STATUS.FULFILLED,
        updatedAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - limit)),
        },
      })
      .populate({
        path: 'from',
        select: 'accountNumber',
        populate: { path: 'owner', select: 'fullName -_id' },
      })
      .populate({
        path: 'to',
        select: 'accountNumber',
        populate: { path: 'owner', select: 'fullName -_id' },
      });
    return [...transactions, ...reminders];
  }

  async getHistoryDetail(accountId: string, user: any) {
    const currentAccount = await this.accountModel.findOne({ owner: user.id });
    if (!currentAccount) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    const transactions = await this.transactionModel
      .find({
        $or: [
          { sender: new mongoose.Types.ObjectId(accountId) },
          { receiver: accountId },
        ],
        status: TRANSACTION_STATUS.FULFILLED,
      })
      .populate({
        path: 'sender',
        select: 'accountNumber',
        populate: [
          { path: 'owner', select: 'fullName -_id' },
          { path: 'bank', select: 'name logo' },
        ],
      })
      .populate({
        path: 'receiver',
        select: 'accountNumber',
        populate: [
          { path: 'owner', select: 'fullName -_id' },
          { path: 'bank', select: 'name logo' },
        ],
      });

    const reminders = await this.remindModel
      .find({
        $or: [
          { from: new mongoose.Types.ObjectId(accountId) },
          { to: new mongoose.Types.ObjectId(accountId) },
        ],
        status: REMIND_STATUS.FULFILLED,
      })
      .populate({
        path: 'from',
        select: 'accountNumber',
        populate: { path: 'owner', select: 'fullName -_id' },
      })
      .populate({
        path: 'to',
        select: 'accountNumber',
        populate: { path: 'owner', select: 'fullName -_id' },
      });
    return [...transactions, ...reminders];
  }

  async createExternalTransaction(
    createExternalTransactionDto: CreateExternalTransactionDto,
    user: any,
  ) {
    const currentUser = await this.userModel
      .findById(user.id)
      .populate('account');
    const currentAccount = currentUser.account as AccountDocument;
    if (currentAccount.status !== 'ACTIVE') {
      throw new BadRequestException(ErrorMessage.ACCOUNT_IS_DISABLED);
    }
    const data = Object.assign({}, createExternalTransactionDto);
    const bank = await this.bankModel.findById(data.bankId);
    if (!bank) {
      throw new BadRequestException(ErrorMessage.BANK_IS_NOT_REGISTERED);
    }

    if (bank.type === BANK_TYPE.PGP) {
      throw new BadRequestException(ErrorMessage.NOT_IMPLEMENTED);
    }
    // CHECK IF EXTERNAL ACCOUNT IS VALID
    let nickname = ""
    try {
      const accountInfo = await this.accountService.getExternalAccountInfo(
        data.accountNumber,
        bank.id,
      );
      if (!accountInfo)
        throw new BadRequestException(ErrorMessage.INVALID_ACCOUNT_NUMBER);
      // console.log(accountInfo)
      nickname = accountInfo["fullName"] || accountInfo["full_name"]
    } catch (error) {
      console.log(error)
      throw new BadRequestException(ErrorMessage.INVALID_ACCOUNT_NUMBER);
    }

    let receiverAccount = await this.accountModel.findOne({
      accountNumber: data.accountNumber,
      type: ACCOUNT_TYPE.EXTERNAL,
      bank: bank.id,
    });
    if (!receiverAccount) {
      receiverAccount = new this.accountModel({
        accountNumber: data.accountNumber,
        type: ACCOUNT_TYPE.EXTERNAL,
        bank: bank.id,
      });
      await receiverAccount.save();
    }

    await this.transactionModel.updateMany(
      {
        sender: currentAccount._id,
        status: TRANSACTION_STATUS.PENDING,
      },
      { status: TRANSACTION_STATUS.REJECTED },
    );

    // const onGoingTransaction = await this.transactionModel.exists({
    //   sender: currentAccount._id,
    //   status: TRANSACTION_STATUS.PENDING,
    // });
    // if (onGoingTransaction) {
    //   throw new BadRequestException(ErrorMessage.ON_GOING_TRANSACTION);
    // }
    if (currentAccount.balance < data.amount) {
      throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
    }
    const fee = this.calculateFee(data.amount);
    if (data.feePayer === PAYER.SENDER) {
      if (currentAccount.balance < data.amount + fee) {
        throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
      }
    }

    const newTransactionData = {
      sender: currentAccount._id,
      receiver: receiverAccount.id,
      amount: data.amount,
      description: data.description,
      type: TRANSACTION_TYPE.EXTERNAL,
      bank: bank.id,
      fee: fee,
      feePayer: data.feePayer,
    };

    const newTransaction = new this.transactionModel(newTransactionData);
    const OTP = new this.otpModel({
      transaction: newTransaction.id,
      otp: this.genOTP(),
      expiry: new Date(+new Date() + OTP_EXPIRED_TIME)
    });
    await newTransaction.save();
    await OTP.save();
    await this.mailService.sendTransactionOTP(OTP, currentUser);

    if (data.saveAsReceiver) {
      try {
        await this.receiverService.create(
          {
            accountNumber: data.accountNumber,
            type: RECEIVER_TYPE.EXTERNAL,
            bank: bank.id,
            nickname: nickname
          },
          user,
        );
      } catch {}
    }
    return newTransaction;
  }

  async confirmExternalTransaction(
    confirmExternalTransactionDto: ConfirmExternalTransactionDto,
    user: any,
  ) {
    const { otp, transaction } = confirmExternalTransactionDto;
    const OTP = await this.otpModel
      .findOne({
        otp: otp,
        transaction: transaction,
      })
      .populate('transaction');
    if (!OTP) {
      throw new BadRequestException(ErrorMessage.INVALID_OTP);
    }
    if (OTP.expiry < new Date()) {
      throw new BadRequestException(ErrorMessage.OTP_EXPIRED);
    }
    const currentUser = await this.userModel
      .findById(user.id)
      .populate('account');
    const currentAccount = currentUser.account as AccountDocument;
    if (currentAccount.status !== 'ACTIVE') {
      throw new BadRequestException(ErrorMessage.ACCOUNT_IS_DISABLED);
    }
    const transactionData = OTP.transaction as TransactionDocument;
    if (transactionData.status != TRANSACTION_STATUS.PENDING) {
      throw new BadRequestException(ErrorMessage.INVALID_TRANSACTION);
    }
    if (transactionData.sender != currentAccount.id) {
      throw new BadRequestException(ErrorMessage.INVALID_OTP);
    }
    if (!transactionData.bank) {
      throw new BadRequestException(ErrorMessage.BANK_IS_NOT_REGISTERED);
    }

    const receiverAccount = await this.accountModel.findById(
      transactionData.receiver,
    );
    if (!receiverAccount) {
      throw new BadRequestException(ErrorMessage.RECEIVER_NOT_EXISTED);
    }

    if (receiverAccount.type !== ACCOUNT_TYPE.EXTERNAL) {
      throw new BadRequestException(ErrorMessage.RECEIVER_NOT_EXISTED);
    }

    if (currentAccount.balance < transactionData.amount) {
      throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
    }
    const fee = this.calculateFee(transactionData.amount);
    let amountToPay = 0,
      amountToReceive = 0;
    if (transactionData.feePayer === PAYER.SENDER) {
      if (currentAccount.balance < transactionData.amount + fee) {
        throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
      }
      amountToPay = transactionData.amount + fee;
      amountToReceive = transactionData.amount;
    } else if (transactionData.feePayer === PAYER.RECEIVER) {
      amountToPay = transactionData.amount;
      amountToReceive = transactionData.amount;
    } else {
      return GenericErrorMessage.BAD_REQUEST;
    }

    // SEND EXTERNAL
    const bank = await this.bankModel.findById(transactionData.bank.toString());
    if (!bank) {
      throw new BadRequestException(ErrorMessage.BANK_IS_NOT_REGISTERED);
    }
    const { baseUrl, publicKeyPath, transferPath, secretKey, type } = bank;
    if (type === BANK_TYPE.PGP) {
      throw new BadRequestException(ErrorMessage.NOT_IMPLEMENTED);
    }
    // const publicKeyRaw = await firstValueFrom(
    //   this.httpService.get(baseUrl + publicKeyPath),
    // );
    // const publicKey = publicKeyRaw.data.data;
    // console.log(publicKey);

    const body = {
      fromAccountNumber: currentAccount.accountNumber,
      toAccountNumber: receiverAccount.accountNumber,
      amount: amountToReceive,
      description: transactionData.description,
      feePayer: transactionData.feePayer,
    };
    const XSignature = await this.encryptionService.sign(JSON.stringify(body));
    const response = await firstValueFrom(
      this.httpService.post(
        baseUrl + transferPath,
        body,
        {
          headers: {
            Signature: crypto
              .createHash('md5')
              .update(JSON.stringify(body) + secretKey)
              .digest('hex'),
            RequestDate: new Date().getTime(),
            'X-Signature': XSignature,
          },
        },
      ),
    );
    const XSignatureReceived = response.headers['x-signature'];
    
    const publicKeyRaw = await firstValueFrom(
      this.httpService.get(baseUrl + publicKeyPath),
    );
    const publicKey = publicKeyRaw.data.data.split(String.raw`\n`).join('\n');
    const verified = await this.encryptionService.RSAverify(
      JSON.stringify(response.data.data),
      XSignatureReceived,
      publicKey,
    );
    if (!verified) {
      throw new UnauthorizedException(ErrorMessage.INVALID_RESPONSE_SIGNATURE);
    }

    await this.accountModel.findByIdAndUpdate(currentAccount.id, {
      $inc: { balance: -amountToPay },
    });
    await this.transactionModel.findByIdAndUpdate(transactionData.id, {
      status: TRANSACTION_STATUS.FULFILLED,
    });
    await this.otpModel.findByIdAndDelete(OTP.id);
    return SuccessMessage.SUCCESS;
  }
}
