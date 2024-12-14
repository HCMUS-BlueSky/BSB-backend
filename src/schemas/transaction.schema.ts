import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Account } from './account.schema';
import { PAYER, TRANSACTION_STATUS } from 'src/common/constants';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  receiver: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  amount: number;

  @Prop({ default: TRANSACTION_STATUS.PENDING, enum: TRANSACTION_STATUS })
  status: string;

  @Prop({ type: String, trim: true })
  description: string;

  @Prop({ type: String, trim: true })
  type: string;

  @Prop({ type: Number, min: 0, default: 0 })
  fee: number;

  @Prop({ default: PAYER.SENDER, enum: PAYER })
  feePayer: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
