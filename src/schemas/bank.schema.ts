import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BANK_TYPE } from 'src/common/constants';

export type BankDocument = HydratedDocument<Bank>;

@Schema({ timestamps: true })
export class Bank {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  logo: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  baseUrl: string;

  @Prop({ type: String, required: true })
  publicKeyPath: string;

  @Prop({ type: String, required: true })
  accountInfoPath: string;

  @Prop({ type: String, required: true })
  transferPath: string;

  @Prop({ type: String, required: true })
  secretKey: string;

  @Prop({ enum: BANK_TYPE })
  type: string;
}

export const BankSchema = SchemaFactory.createForClass(Bank);
