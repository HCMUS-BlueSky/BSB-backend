import { BadRequestException, Injectable } from '@nestjs/common';
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
  FEE,
  PAYER,
  TRANSACTION_STATUS,
} from 'src/common/constants';
import { OTP, OTPDocument } from 'src/schemas/otp.schema';
import { MailService } from 'src/services/mail/mail.service';
import { ConfirmInternalTransactionDto } from './dto/confirm-internal-transaction.dto';
import { ResendTransactionOTPDto } from './dto/resend-otp.dto';

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
    private readonly mailService: MailService,
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
    const onGoingTransaction = await this.transactionModel.exists({
      sender: currentAccount._id,
      status: TRANSACTION_STATUS.PENDING,
    });
    if (onGoingTransaction) {
      throw new BadRequestException(ErrorMessage.ON_GOING_TRANSACTION);
    }
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
    });
    await newTransaction.save();
    await OTP.save();
    await this.mailService.sendTransactionOTP(OTP, currentUser);
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

  async getHistory(user: any) {
    const currentAccount = await this.accountModel.findOne({ owner: user.id });
    if (!currentAccount) {
      throw new BadRequestException(ErrorMessage.INVALID_USER);
    }
    const outTransaction = await this.transactionModel.find({
      sender: currentAccount._id,
      status: TRANSACTION_STATUS.FULFILLED,
    });
    const inTransaction = await this.transactionModel.find({
      receiver: currentAccount.id,
      status: TRANSACTION_STATUS.FULFILLED,
    });
    return [...outTransaction, ...inTransaction];
  }
}
