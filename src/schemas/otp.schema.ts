import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Transaction } from './transaction.schema';
import { OTP_EXPIRED_TIME } from 'src/common/constants';

export type OTPDocument = HydratedDocument<OTP>;

@Schema({ timestamps: true })
export class OTP {
  @Prop({ type: Types.ObjectId, ref: Transaction.name, required: true })
  transaction: Transaction;

  @Prop({ maxlength: 6, required: true })
  otp: string;

  @Prop({
    default: new Date(+new Date() + OTP_EXPIRED_TIME),
    required: true,
  })
  expiry: Date;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);
