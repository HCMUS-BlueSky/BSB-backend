import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ROLES } from 'src/common/constants';
import { Receiver } from './receiver.schema';
import { AccountDocument } from './account.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  dob: Date;

  @Prop({ default: ROLES.CUSTOMER, enum: ROLES })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  account: Types.ObjectId | AccountDocument;

  @Prop({ type: [Types.ObjectId], ref: 'Receiver' })
  receiverList: Receiver[];
}

export const UserSchema = SchemaFactory.createForClass(User);
