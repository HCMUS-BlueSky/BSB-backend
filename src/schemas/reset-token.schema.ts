import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type ResetTokenDocument = HydratedDocument<ResetToken>;

@Schema({ timestamps: true })
export class ResetToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  owner: User;

  @Prop({ unique: true, required: true })
  token: string;

  createdAt: Date;
}

export const ResetTokenSchema = SchemaFactory.createForClass(ResetToken);
