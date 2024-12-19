import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import { UpdateReceiverDto } from './dto/update-receiver.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { Receiver, ReceiverDocument } from 'src/schemas/receiver.schema';
import { ACCOUNT_TYPE, RECEIVER_TYPE } from 'src/common/constants';
import { Account, AccountDocument } from 'src/schemas/account.schema';
import { ErrorMessage, SuccessMessage } from 'src/common/messages';

@Injectable()
export class ReceiverService {
  constructor(
    @InjectModel(User.name, 'users') private userModel: Model<UserDocument>,
    @InjectModel(Receiver.name, 'users')
    private receiverModel: Model<ReceiverDocument>,
    @InjectModel(Account.name, 'users')
    private accountModel: Model<AccountDocument>,
  ) {}

  async create(createReceiverDto: CreateReceiverDto, user: any) {
    const data = Object.assign({}, createReceiverDto);
    if (data.type === RECEIVER_TYPE.INTERNAL) {
      const associatedAccount = await this.accountModel
        .findOne({
          accountNumber: data.accountNumber,
          type: ACCOUNT_TYPE.INTERNAL,
        })
        .populate('owner', 'fullName');

      if (!associatedAccount) {
        throw new BadRequestException(ErrorMessage.ACCOUNT_NOT_EXIST);
      }
      if (associatedAccount.owner.id == user.id) {
        throw new BadRequestException(ErrorMessage.RECEIVER_IS_SAME);
      }
      const existed = await this.receiverModel.exists({
        of: user.id,
        accountNumber: data.accountNumber,
      });
      if (existed) {
        throw new BadRequestException(ErrorMessage.RECEIVER_EXISTED);
      }
      if (!data.nickname) {
        data.nickname = associatedAccount.owner.fullName;
      }
      const newReceiver = new this.receiverModel({ ...data, of: user.id });
      await newReceiver.save();
      await this.userModel.findByIdAndUpdate(user.id, {
        $push: { receiverList: newReceiver.id },
      });
      return SuccessMessage.SUCCESS;
    }
    throw new BadRequestException(ErrorMessage.NOT_IMPLEMENTED);
  }

  async getReceiverList(user: any) {
    const receiverList = await this.userModel
      .findById(user.id)
      .select('receiverList -_id')
      .populate('receiverList');
    return receiverList;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} receiver`;
  // }

  async update(id: string, updateReceiverDto: UpdateReceiverDto, user: any) {
    const existed = await this.receiverModel.exists({
      of: user.id,
      _id: id,
    });
    if (!existed) {
      throw new BadRequestException(ErrorMessage.RECEIVER_NOT_EXISTED);
    }
    await this.receiverModel.findOneAndUpdate(
      {
        of: user.id,
        _id: id,
      },
      {
        nickname: updateReceiverDto.nickname,
      },
    );
    return SuccessMessage.SUCCESS;
  }

  async remove(id: string, user: any) {
    const existed = await this.receiverModel.exists({
      of: user.id,
      _id: id,
    });
    if (!existed) {
      throw new BadRequestException(ErrorMessage.RECEIVER_NOT_EXISTED);
    }
    await this.userModel.findByIdAndUpdate(user.id, {
      $pull: {
        receiverList: id,
      },
    });
    await this.receiverModel.findOneAndDelete({
      of: user.id,
      _id: id,
    });
    return SuccessMessage.SUCCESS;
  }
}
