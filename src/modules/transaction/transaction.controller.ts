import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateInternalTransactionDto } from './dto/create-internal-transaction.dto';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { RolesGuard } from 'src/vendors/guards/role.guard';
import { Roles } from 'src/vendors/decorators/role.decorator';
import { ROLES } from 'src/common/constants';
import { BaseController } from 'src/vendors/base';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { ConfirmInternalTransactionDto } from './dto/confirm-internal-transaction.dto';
import { ResendTransactionOTPDto } from './dto/resend-otp.dto';
import { IsObjectIdPipe } from 'nestjs-object-id';
import { EncryptionService } from 'src/services/encryption/encryption.service';

@Controller('transfer')
@UseGuards(AuthGuard, RolesGuard)
export class TransactionController extends BaseController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  @Post('/internal')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Create internal transaction',
    description: 'Create internal transaction',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async transferInternal(
    @Body() createInternalTransactionDto: CreateInternalTransactionDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.transactionService.createInternalTransaction(
        createInternalTransactionDto,
        user,
      ),
    );
  }

  @Post('/internal/confirm')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Confirm internal transaction',
    description: 'Confirm internal transaction with OTP',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async confirmTransferInternal(
    @Body() createInternalTransactionDto: ConfirmInternalTransactionDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.transactionService.confirmInternalTransaction(
        createInternalTransactionDto,
        user,
      ),
    );
  }

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get on-going transaction',
    description: 'Get on-going transaction of current user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getCurrentTransaction(@AuthUser() user: any) {
    return this.response(
      await this.transactionService.getCurrentTransaction(user),
    );
  }

  @Post('/resendOTP')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Resend OTP for transaction',
    description: 'Resend OTP for transaction',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async resendOTP(
    @Body() resendTransactionOTPDTO: ResendTransactionOTPDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.transactionService.resendTransactionOTP(
        resendTransactionOTPDTO,
        user,
      ),
    );
  }

  @Get('/history')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Get transaction history',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getHistory(@AuthUser() user: any) {
    return this.response(await this.transactionService.getHistory(user));
  }

  @Get('/history/:id')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.EMPLOYEE, ROLES.ADMIN])
  @ApiOperation({
    summary: 'Get transaction detail',
    description: 'Get transaction detail',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getHistoryDetail(
    @Param('id', IsObjectIdPipe) id: string,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.transactionService.getHistoryDetail(id, user),
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.transactionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
  //   return this.transactionService.update(+id, updateTransactionDto);
  // }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Cancel transaction',
    description: 'Cancel current transaction',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async remove(@Param('id', IsObjectIdPipe) id: string, @AuthUser() user: any) {
    return this.response(await this.transactionService.remove(id, user));
  }

  @Get('/external/publicKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public key for encryption',
    description: 'Get public key for encryption to use for external transfer',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  getPublicKey() {
    return this.response(this.encryptionService.getPublicKey());
  }
}
