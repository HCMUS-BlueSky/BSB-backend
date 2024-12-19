import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BankDocument = HydratedDocument<Bank>;

@Schema({ timestamps: true })
export class Bank {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  logo: string;

  @Prop({ type: String, required: true })
  endpoint: string;
}

export const BankSchema = SchemaFactory.createForClass(Bank);
