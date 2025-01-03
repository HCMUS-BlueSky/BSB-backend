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
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateInternalTransactionDto } from './dto/create-internal-transaction.dto';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { RolesGuard } from 'src/vendors/guards/role.guard';
import { Roles } from 'src/vendors/decorators/role.decorator';
import { ROLES } from 'src/common/constants';
import { BaseController } from 'src/vendors/base';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { ConfirmInternalTransactionDto } from './dto/confirm-internal-transaction.dto';
import { ResendTransactionOTPDto } from './dto/resend-otp.dto';
import { IsObjectIdPipe } from 'nestjs-object-id';
import { CreateExternalTransactionDto } from './dto/create-external-transaction.dto';
import { ConfirmExternalTransactionDto } from './dto/confirm-external-transaction.dto';

@Controller('transfer')
@UseGuards(AuthGuard, RolesGuard)
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

  @Get('/history')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Get transaction history',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'limit',
    default: 30,
    required: false,
    description: 'Limit number of days',
  })
  async getHistory(
    @AuthUser() user: any,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.response(await this.transactionService.getHistory(user, limit));
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

  @Post('/external')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Create exernal transaction',
    description: 'Create exernal transaction',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async transferExternal(
    @Body() createExternalTransactionDto: CreateExternalTransactionDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.transactionService.createExternalTransaction(
        createExternalTransactionDto,
        user,
      ),
    );
  }

  @Post('/external/confirm')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Confirm exernal transaction',
    description: 'Confirm exernal transaction with OTP',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async confirmTransferExternal(
    @Body() confirmExternalTransactionDto: ConfirmExternalTransactionDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.transactionService.confirmExternalTransaction(
        confirmExternalTransactionDto,
        user,
      ),
    );
  }
}
