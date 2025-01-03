import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RECEIVER_TYPE } from 'src/common/constants';
import { User } from './user.schema';
import { Bank, BankDocument } from './bank.schema';

export type ReceiverDocument = HydratedDocument<Receiver>;

@Schema({ timestamps: true })
export class Receiver {
  @Prop({ type: Types.ObjectId, ref: User.name })
  of: Types.ObjectId;

  @Prop({ type: String, required: true })
  accountNumber: string;

  @Prop({ type: String, required: true })
  nickname: string;

  @Prop({ default: RECEIVER_TYPE.INTERNAL, enum: RECEIVER_TYPE })
  type: string;

  @Prop({ type: Types.ObjectId, ref: Bank.name })
  bank: BankDocument;
}

export const ReceiverSchema = SchemaFactory.createForClass(Receiver);
