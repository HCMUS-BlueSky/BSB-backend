import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { REMIND_STATUS } from 'src/common/constants';
import { Account } from './account.schema';

export type RemindDocument = HydratedDocument<Remind>;

@Schema({ timestamps: true })
export class Remind {
  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  from: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  to: Types.ObjectId;

  @Prop({ type: String })
  message: string;

  @Prop({ default: REMIND_STATUS.PENDING, enum: REMIND_STATUS })
  status: string;

  @Prop({ type: Number, required: true, min: 100, default: 0 })
  amount: number;
}

export const RemindSchema = SchemaFactory.createForClass(Remind);
