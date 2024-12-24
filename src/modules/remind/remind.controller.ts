import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RemindService } from './remind.service';
import { CreateRemindDto } from './dto/create-remind.dto';
import { BaseController } from 'src/vendors/base';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { IsObjectIdPipe } from 'nestjs-object-id';
import { ConfirmRepayDto } from './dto/confirm-repay.dto';

@Controller('remind')
@UseGuards(AuthGuard)
export class RemindController extends BaseController {
  constructor(private readonly remindService: RemindService) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Add reminder',
    description: 'Add reminder to list of current logged in user',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiBearerAuth()
  async create(
    @Body() createRemindDto: CreateRemindDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.remindService.create(createRemindDto, user),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get all reminders',
    description: 'Get all reminders of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async findAllReminders(@AuthUser() user: any) {
    return this.response(await this.remindService.findAllReminders(user));
  }

  @Get('/sent')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get all sent reminders',
    description: 'Get all sent reminders of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async findAllSentReminders(@AuthUser() user: any) {
    return this.response(await this.remindService.findAllSentReminders(user));
  }

  @Get('/received')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get all received reminders',
    description: 'Get all received reminders of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async findAllReceivedReminders(@AuthUser() user: any) {
    return this.response(
      await this.remindService.findAllReceivedReminders(user),
    );
  }
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRemindDto: UpdateRemindDto) {
  //   return this.remindService.update(+id, updateRemindDto);
  // }
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Delete reminder',
    description: 'Delete reminder of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async remove(@Param('id', IsObjectIdPipe) id: string, @AuthUser() user: any) {
    return this.response(await this.remindService.remove(id, user));
  }

  @Post('/:id/otp')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Sent OTP to for to repay debt',
    description: 'Sent OTP to for to repay debt',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async post(@Param('id', IsObjectIdPipe) id: string, @AuthUser() user: any) {
    return this.response(await this.remindService.sendOTP(id, user));
  }

  @Post('/:id/repay')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Confirm repay debt',
    description: 'Confirm repay debt with OTP',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async confirmTransferInternal(
    @Body() confirmRepayDto: ConfirmRepayDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.remindService.confirmRepay(confirmRepayDto, user),
    );
  }
}
