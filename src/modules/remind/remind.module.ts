import { Module } from '@nestjs/common';
import { RemindService } from './remind.service';
import { RemindController } from './remind.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Remind, RemindSchema } from 'src/schemas/remind.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Account, AccountSchema } from 'src/schemas/account.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Remind.name, schema: RemindSchema },
        { name: User.name, schema: UserSchema },
        { name: Account.name, schema: AccountSchema },
      ],
      'users',
    ),
  ],
  controllers: [RemindController],
  providers: [RemindService],
})
export class RemindModule {}
