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
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EncryptionService } from 'src/services/encryption/encryption.service';

@Injectable()
export class ExternalGuard implements CanActivate {
  constructor(
    @Inject(ExternalService) private readonly authService: ExternalService,
    @InjectModel(Bank.name, 'users') private bankModel: Model<BankDocument>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly encryptionService: EncryptionService,
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
      // throw new UnauthorizedException(ErrorMessage.BANK_IS_NOT_REGISTERED);
      request.bank = banks[0]; // Disable later
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

    // CHECK INTEGRITY
    console.log("asdsadasd");
    const signature = request.get('Signature');
    if (!signature) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REQUEST_TAMPERED);
    }
    const calculated = crypto
      .createHash('md5')
      .update(
        JSON.stringify(request.body) + this.configService.get('SECRET_API_KEY'),
      )
      .digest('hex');

    if (signature !== calculated) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REQUEST_TAMPERED);
    }

    // VERIFY TOKEN
    const XSignature = request.get('X-Signature');
    if (!XSignature) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REQUEST_SIGNATURE);
    }
    const { baseUrl, publicKeyPath } = request.bank;
    const publicKeyRaw = await firstValueFrom(
      this.httpService.get(baseUrl + publicKeyPath),
    );
    const publicKey = publicKeyRaw.data.data.split(String.raw`\n`).join('\n');
    const verified = await this.encryptionService.RSAverify(
      JSON.stringify(request.body),
      XSignature,
      publicKey,
    );
    if (!verified) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REQUEST_SIGNATURE);
    }
    return true;
  }
}
