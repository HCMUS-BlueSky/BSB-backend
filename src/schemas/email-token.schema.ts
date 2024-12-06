import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type EmailTokenDocument = HydratedDocument<EmailToken>;

@Schema({ timestamps: true })
export class EmailToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  owner: User;

  @Prop({ unique: true, required: true })
  token: string;

  createdAt: Date;
}

export const EmailTokenSchema = SchemaFactory.createForClass(EmailToken);
