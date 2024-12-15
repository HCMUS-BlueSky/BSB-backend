import { PickType } from '@nestjs/swagger';
import { CreateReceiverDto } from './create-receiver.dto';

export class UpdateReceiverDto extends PickType(CreateReceiverDto, [
  'nickname',
] as const) {}
