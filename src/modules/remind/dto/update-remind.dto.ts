import { PartialType } from '@nestjs/swagger';
import { CreateRemindDto } from './create-remind.dto';

export class UpdateRemindDto extends PartialType(CreateRemindDto) {}
