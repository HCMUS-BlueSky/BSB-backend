import { User, UserDocument } from 'src/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { CreateRemindDto } from './dto/create-remind.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Remind, RemindDocument } from 'src/schemas/remind.schema';
import { Model } from 'mongoose';
import {
  SuccessMessage,
  ErrorMessage,
  CustomMessages,
} from 'src/common/messages';
import { BadRequestException } from '@nestjs/common';
import { Account, AccountDocument } from 'src/schemas/account.schema';
import { ACCOUNT_TYPE, OTP_EXPIRED_TIME, REMIND_STATUS } from 'src/common/constants';
import { OTP, OTPDocument } from 'src/schemas/otp.schema';
import { MailService } from 'src/services/mail/mail.service';
import { ConfirmRepayDto } from './dto/confirm-repay.dto';
import { DeleteRemindDto } from './dto/delete-remind.dto';
import { NotificationService } from '../notification/notification.service';
import {
  Notification,
  NotificationDocument,
} from 'src/schemas/notification.schema';

@Injectable()
export class RemindService {
  constructor(
    @InjectModel(Remind.name, 'users')
    private remindModel: Model<RemindDocument>,
    @InjectModel(User.name, 'users')
    private userModel: Model<User>,
    @InjectModel(Account.name, 'users')
    private accountModel: Model<Account>,
    @InjectModel(OTP.name, 'users') private otpModel: Model<OTPDocument>,
    @InjectModel(Notification.name, 'users')
    private notificationModel: Model<NotificationDocument>,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}
  async create(createRemindDto: CreateRemindDto, user: any) {
    const { accountNumber, message, amount } = createRemindDto;
    const currentUser = await this.userModel
      .findById(user.id)
      .populate('account');
    const currentAccount = currentUser.account as AccountDocument;

    if (accountNumber == currentAccount.accountNumber) {
      throw new BadRequestException(ErrorMessage.RECEIVER_IS_SAME);
    }

    const account = await this.accountModel.findOne({
      accountNumber: accountNumber,
      type: ACCOUNT_TYPE.INTERNAL,
    });

    if (!account) {
      throw new BadRequestException(ErrorMessage.INVALID_USER_REMIND);
    }

    const newRemind = new this.remindModel({
      from: currentAccount._id,
      to: account._id,
      message,
      amount,
    });
    await newRemind.save();

    const remindData = await this.populateRemindMessage(newRemind.id);

    const notification = new this.notificationModel({
      title: CustomMessages.CREATE_PAYMENT_REQUEST,
      message: JSON.stringify(remindData),
      for: account.owner.toString(),
    });
    await notification.save();
    await this.notificationService.emit(notification);

    return SuccessMessage.SUCCESS;
  }

  // Data repsonse for findAllReminders
  // {
  //   name: "Nguyen Minh Khoi",
  //   profilePic: "https://my.timo.vn/static/media/default_avatar.32a9a6f8.svg",
  //   amount: 10000,
  //   direction: "tới",
  //   date: "9/12/2024",
  // },
  async findAllReminders(user: any) {
    const currentUser = await this.userModel.findById(user.id);

    const reminders = await this.remindModel
      .find({
        $or: [{ from: currentUser.account }, { to: currentUser.account }],
      })
      .sort({
        updatedAt: -1,
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

    return reminders;
  }

  async findAllSentReminders(user: any) {
    const currentUser = await this.userModel.findById(user.id);

    const reminders = await this.remindModel
      .find({
        from: currentUser.account,
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

    return reminders;
  }

  async findAllReceivedReminders(user: any) {
    const currentUser = await this.userModel.findById(user.id);

    const reminders = await this.remindModel
      .find({
        to: currentUser.account,
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

    return reminders;
  }

  findAll() {
    return `This action returns all remind`;
  }

  // update(id: number, updateRemindDto: UpdateRemindDto) {
  //   return `This action updates a #${id} remind`;
  // }

  async remove(id: string, user: any, deleteRemindDto: DeleteRemindDto) {
    const { message } = deleteRemindDto;
    const currentUser = await this.userModel.findById(user.id);

    const remind = await this.remindModel.findOne({
      _id: id,
      $or: [{ from: currentUser.account }, { to: currentUser.account }],
      status: REMIND_STATUS.PENDING,
    });

    if (!remind) {
      throw new BadRequestException(ErrorMessage.INVALID_REMIND);
    }

    if (remind.from.toString() == currentUser.account.toString()) {
      const toAccount = await this.accountModel
        .findById(remind.to)
        .populate('owner')
        .select('owner');
      const toUser = toAccount.owner as UserDocument;

      const remindMessage = await this.populateRemindMessage(remind.id);

      const notification = new this.notificationModel({
        title: CustomMessages.CANCEL_PAYMENT_REQUEST,
        message: JSON.stringify(remindMessage),
        for: toUser.id,
      });
      await notification.save();
      await this.notificationService.emit(notification);
      await this.remindModel.findOneAndDelete({
        _id: id,
        from: currentUser.account,
        status: REMIND_STATUS.PENDING,
      });
    } else if (remind.to.toString() == currentUser.account.toString()) {
      const fromAccount = await this.accountModel
        .findById(remind.from)
        .populate('owner')
        .select('owner');
      const fromUser = fromAccount.owner as UserDocument;

      const remindMessage = await this.populateRemindMessage(remind.id);

      const notification = new this.notificationModel({
        title: CustomMessages.CANCEL_PAYMENT_REQUEST,
        message: JSON.stringify(remindMessage),
        for: fromUser.id,
      });
      await notification.save();
      await this.notificationService.emit(notification);
      await this.remindModel.findOneAndDelete({
        _id: id,
        to: currentUser.account,
        status: REMIND_STATUS.PENDING,
      });
    } else {
      throw new BadRequestException(ErrorMessage.INVALID_REMIND);
    }

    return SuccessMessage.SUCCESS;
  }

  async sendOTP(id: string, user: any) {
    const currentUser = await this.userModel.findById(user.id);

    const remind = await this.remindModel.findOne({
      _id: id,
      to: currentUser.account,
      status: REMIND_STATUS.PENDING,
    });

    if (!remind) {
      throw new BadRequestException(ErrorMessage.INVALID_REMIND);
    }
    await this.otpModel.findOneAndDelete({
      remind: remind.id,
    });
    const OTP = new this.otpModel({
      remind: remind.id,
      otp: this.genOTP(),
      expiry: new Date(+new Date() + OTP_EXPIRED_TIME)
    });
    await OTP.save();
    await this.mailService.sendRemindOTP(OTP, currentUser);

    return SuccessMessage.SUCCESS;
  }

  genOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  async confirmRepay(confirmRepay: ConfirmRepayDto, user: any) {
    const { otp, remind } = confirmRepay;
    const OTP = await this.otpModel
      .findOne({
        remind: remind,
        otp,
      })
      .populate('remind');

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
    const remindData = OTP.remind as RemindDocument;

    if (remindData.status != REMIND_STATUS.PENDING) {
      throw new BadRequestException(ErrorMessage.INVALID_TRANSACTION);
    }
    if (remindData.to.toString() != currentAccount.id) {
      throw new BadRequestException(ErrorMessage.INVALID_OTP);
    }

    const receiverAccount = await this.accountModel.findById(remindData.from);
    if (!receiverAccount) {
      throw new BadRequestException(ErrorMessage.RECEIVER_NOT_EXISTED);
    }
    if (currentAccount.status !== 'ACTIVE') {
      throw new BadRequestException(ErrorMessage.ACCOUNT_IS_DISABLED);
    }
    if (receiverAccount.status !== 'ACTIVE') {
      throw new BadRequestException(ErrorMessage.RECEIVER_IS_DISABLED);
    }

    if (currentAccount.balance < remindData.amount) {
      throw new BadRequestException(ErrorMessage.INSUFFICIENT_BALANCE);
    }
    await this.accountModel.findByIdAndUpdate(currentAccount.id, {
      $inc: { balance: -remindData.amount },
    });
    await this.accountModel.findByIdAndUpdate(receiverAccount.id, {
      $inc: { balance: remindData.amount },
    });
    await this.remindModel.findByIdAndUpdate(remindData.id, {
      status: REMIND_STATUS.FULFILLED,
    });
    await this.otpModel.findByIdAndDelete(OTP.id);

    const remindMessage = await this.populateRemindMessage(remindData.id);

    const notification = new this.notificationModel({
      title: CustomMessages.FULFILLED_PAYMENT_REQUEST,
      message: JSON.stringify(remindMessage),
      for: receiverAccount.owner.toString(),
    });
    await notification.save();
    await this.notificationService.emit(notification);

    return SuccessMessage.SUCCESS;
  }

  private async populateRemindMessage(remindId: string) {
    return await this.remindModel
      .findById(remindId)
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
  }
}
