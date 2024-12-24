import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RemindService } from './remind.service';
import { CreateRemindDto } from './dto/create-remind.dto';
import { UpdateRemindDto } from './dto/update-remind.dto';
import { BaseController } from 'src/vendors/base';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';

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
  @ApiResponse({ status: 200, description: 'Success' })
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
  @ApiOperation({
    summary: 'Get all reminders',
    description: 'Get all reminders of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async findAllReminders(@AuthUser() user: any) {
    return this.response(await this.remindService.findAllReminders(user));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete reminder',
    description: 'Delete reminder of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.response(await this.remindService.remove(id));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update reminder',
    description: 'Update reminder of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async update(@Param('id') id: string) {
    return this.response(await this.remindService.update(id));
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRemindDto: UpdateRemindDto) {
  //   return this.remindService.update(+id, updateRemindDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.remindService.remove(+id);
  // }
}
