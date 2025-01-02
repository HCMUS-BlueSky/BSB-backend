import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { ACCOUNT_TYPE } from 'src/common/constants';
import { Bank, BankDocument } from './bank.schema';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: Types.ObjectId, ref: User.name })
  owner: UserDocument;

  @Prop({ type: String, required: true, maxlength: 20 })
  accountNumber: string;

  @Prop({ type: Number, default: 0, min: 0 })
  balance: number;

  @Prop({ type: String, default: 'ACTIVE' })
  status: string;

  @Prop({ default: ACCOUNT_TYPE.INTERNAL, enum: ACCOUNT_TYPE })
  type: string;

  @Prop({ type: Types.ObjectId, ref: Bank.name })
  bank: BankDocument;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
