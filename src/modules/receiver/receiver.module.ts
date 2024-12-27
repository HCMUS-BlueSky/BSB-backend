import { Module } from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { ReceiverController } from './receiver.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Receiver, ReceiverSchema } from 'src/schemas/receiver.schema';
import { Account, AccountSchema } from 'src/schemas/account.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: Receiver.name, schema: ReceiverSchema },
        { name: Account.name, schema: AccountSchema },
      ],
      'users',
    ),
  ],
  controllers: [ReceiverController],
  providers: [ReceiverService],
  exports: [ReceiverService],
})
export class ReceiverModule {}
