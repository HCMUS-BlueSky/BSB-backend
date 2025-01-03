import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorMessage } from 'src/common/messages';
import { ExternalService } from 'src/modules/external/external.service';
import { Bank, BankDocument } from 'src/schemas/bank.schema';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExternalGuard implements CanActivate {
  constructor(
    @Inject(ExternalService) private readonly authService: ExternalService,
    @InjectModel(Bank.name, 'users') private bankModel: Model<BankDocument>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // CHECK IP BANK
    const banks = await this.bankModel.find();
    banks.forEach((bank) => {
      if (bank.ip === request.ip) {
        request.bank = bank;
        return true;
      }
    });
    if (!request.bank) {
      throw new UnauthorizedException(ErrorMessage.BANK_IS_NOT_REGISTERED);
      // request.bank = banks[0]; // Disable later
    }
    // CHECK DATE
    const requestDate = request.get('RequestDate');
    if (!requestDate) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REQUEST_DATE);
    }
    const currentDate = new Date();
    const diff = currentDate.getTime() - parseInt(requestDate);
    // console.log(diff);
    if (diff > 30000) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REQUEST_DATE);
    }

    // CHECK SIGNATURE
    const signature = request.get('Signature');
    if (!signature) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REQUEST_SIGNATURE);
    }
    const calculated = crypto
      .createHash('md5')
      .update(
        JSON.stringify(request.body) + this.configService.get('SECRET_API_KEY'),
      )
      .digest('hex');

    if (signature !== calculated) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REQUEST_SIGNATURE);
    }
    return true;
  }
}
