import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
