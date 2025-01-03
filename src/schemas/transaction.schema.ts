import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Account } from './account.schema';
import {
  PAYER,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from 'src/common/constants';
import { Bank, BankDocument } from './bank.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  receiver: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 100, default: 0 })
  amount: number;

  @Prop({ default: TRANSACTION_STATUS.PENDING, enum: TRANSACTION_STATUS })
  status: string;

  @Prop({ type: String, trim: true })
  description: string;

  @Prop({ default: TRANSACTION_TYPE.INTERNAL, enum: TRANSACTION_TYPE })
  type: string;

  @Prop({ type: Number, min: 0, default: 0 })
  fee: number;

  @Prop({ default: PAYER.SENDER, enum: PAYER })
  feePayer: string;

  @Prop({ type: Types.ObjectId, ref: Bank.name })
  bank: BankDocument;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
