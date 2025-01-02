import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ExternalService } from './external.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from 'src/vendors/base';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { AccountService } from '../account/account.service';
import { ExternalDto } from './dto/external.dto';
import { AccountInfoDto } from './dto/account-info.dto';
import { ExternalGuard } from 'src/vendors/guards/external.guard';
import { FromBank } from 'src/vendors/decorators/bank.decorator';

@Controller('external')
export class ExternalController extends BaseController {
  constructor(
    private readonly externalService: ExternalService,
    private readonly encryptionService: EncryptionService,
    private readonly accountService: AccountService,
  ) {
    super();
  }

  @Get('/publicKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public key for encryption',
    description: 'Get public key for encryption to use for external transfer',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  getPublicKey() {
    return this.response(this.encryptionService.getPublicKey());
  }

  @Get('/banks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get registered bank',
    description: 'Get all registered bank',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  async getBanks() {
    return this.response(await this.externalService.getBanks());
  }

  @Post('/account/info')
  @UseGuards(ExternalGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user info by account number',
    description: 'Get user info by account number',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  async getUserInfoByAccountNumber(@Body() accountInfoDto: AccountInfoDto) {
    return this.response(
      await this.externalService.getUserInfoByAccountNumber(
        accountInfoDto.data,
      ),
    );
  }

  @Post('/transfer')
  @UseGuards(ExternalGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transfer money to internal account',
    description: 'Transfer money to internal account (used by external bank)',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  async externalTransfer(
    @Body() externalDto: ExternalDto,
    @FromBank() bank: any,
  ) {
    return this.response(
      await this.externalService.transfer(externalDto, bank),
    );
  }

  @Get('/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public key for encryption',
    description: 'Get public key for encryption to use for external transfer',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  async test() {
    const data = await this.encryptionService.encrypt('lmaolmao');
    console.log(await this.encryptionService.decrypt(data));
    return this.response(data);
  }
}
