import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { REMIND_STATUS } from 'src/common/constants';

export type RemindDocument = HydratedDocument<Remind>;

@Schema({ timestamps: true })
export class Remind {
  @Prop({ type: String, required: true })
  from: string;

  @Prop({ type: String, required: true })
  to: string;

  @Prop({ type: String })
  remindMessage: string;

  @Prop({ default: REMIND_STATUS.PENDING, enum: REMIND_STATUS })
  remindStatus: string;

  @Prop({ type: Number, required: true })
  amount: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const RemindSchema = SchemaFactory.createForClass(Remind);
