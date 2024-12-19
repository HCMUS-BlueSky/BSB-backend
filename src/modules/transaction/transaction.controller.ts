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
import { BaseController } from 'src/vendors/base';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { ConfirmInternalTransactionDto } from './dto/confirm-internal-transaction.dto';
import { ResendTransactionOTPDto } from './dto/resend-otp.dto';
import { IsObjectIdPipe } from 'nestjs-object-id';

@Controller('transfer')
@UseGuards(AuthGuard)
export class TransactionController extends BaseController {
  constructor(private readonly transactionService: TransactionService) {
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
  // @Get()
  // findAll() {
  //   return this.transactionService.findAll();
  // }

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
}
