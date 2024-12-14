import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { EmailToken, EmailTokenDocument } from 'src/schemas/email-token.schema';
import { ResetToken, ResetTokenDocument } from 'src/schemas/reset-token.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { AccountService } from '../account/account.service';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountServive: AccountService,
    @InjectModel(User.name, 'users') private userModel: Model<UserDocument>,
    @InjectModel(EmailToken.name, 'users')
    private emailTokenModel: Model<EmailTokenDocument>,
    @InjectModel(ResetToken.name, 'users')
    private resetTokenModel: Model<ResetTokenDocument>,
  ) {}
  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email: email });
  }

  async createUser(data: object) {
    const user = new this.userModel(data);
    const account = await this.accountServive.createAccountForUser(
      user._id.toString(),
    );
    user.account = account._id;
    return await user.save();
  }

  async getProfile(user: any) {
    return await this.userModel.findById(user.id).select('-password -account');
  }
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
