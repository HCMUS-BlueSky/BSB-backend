import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: Types.ObjectId, ref: User.name })
  owner: Types.ObjectId;

  @Prop({ type: String, required: true, maxlength: 20 })
  accountNumber: string;

  @Prop({ type: Number, default: 0, min: 0 })
  balance: number;

  @Prop({ type: String, default: 'ACTIVE' })
  status: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
