import { User } from 'src/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { CreateRemindDto } from './dto/create-remind.dto';
import { UpdateRemindDto } from './dto/update-remind.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Remind, RemindDocument } from 'src/schemas/remind.schema';
import { Model } from 'mongoose';
import { SuccessMessage, ErrorMessage } from 'src/common/messages';
import { BadRequestException } from '@nestjs/common';
import { Account } from 'src/schemas/account.schema';

@Injectable()
export class RemindService {
  constructor(
    @InjectModel(Remind.name, 'users')
    private remindModel: Model<RemindDocument>,
    @InjectModel(User.name, 'users')
    private userModel: Model<User>,
    @InjectModel(Account.name, 'users')
    private accountModel: Model<Account>,
  ) {}
  async create(createRemindDto: CreateRemindDto, user: any) {
    const data = Object.assign({}, createRemindDto);

    const ownerAccount = await this.accountModel.findOne({
      accountNumber: data.remindUserAccount,
    });

    if (!ownerAccount) {
      throw new BadRequestException(ErrorMessage.INVALID_USER_REMIND);
    }

    const newRemind = {
      from: user.id,
      to: ownerAccount.owner,
      remindMessage: data.remindMessage,
      amount: data.amount,
    };
    await this.remindModel.create(newRemind);
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
    const remindersFrom = await this.remindModel.find({ from: user.id });
    const remindersTo = await this.remindModel.find({ to: user.id });
    const reminders = [...remindersFrom, ...remindersTo];

    const dataResponse = await Promise.all(
      reminders.map(async (remind) => {
        const remindUser = await this.userModel.findById(remind.to);
        return {
          name: remindUser?.fullName || 'Unknown User',
          profilePic:
            'https://my.timo.vn/static/media/default_avatar.32a9a6f8.svg',
          amount: remind.amount,
          direction: remind.from === user.id ? 'tới' : 'từ',
          date: remind.createdAt,
          status: remind.remindStatus,
        };
      }),
    );

    return dataResponse;
  }

  findAll() {
    return `This action returns all remind`;
  }

  // update(id: number, updateRemindDto: UpdateRemindDto) {
  //   return `This action updates a #${id} remind`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} remind`;
  // }
}
