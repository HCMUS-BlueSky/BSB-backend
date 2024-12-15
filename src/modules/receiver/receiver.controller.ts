import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { BaseController } from 'src/vendors/base';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import { UpdateReceiverDto } from './dto/update-receiver.dto';

@Controller('receiver')
@UseGuards(AuthGuard)
export class ReceiverController extends BaseController {
  constructor(private readonly receiverService: ReceiverService) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Add receiver',
    description: 'Add receiver to list of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async create(
    @Body() createReceiverDto: CreateReceiverDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.receiverService.create(createReceiverDto, user),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get receiver list',
    description: 'Get receiver list of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getReceiverList(@AuthUser() user: any) {
    return this.response(await this.receiverService.getReceiverList(user));
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.receiverService.findOne(+id);
  // }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Edit receiver',
    description: 'Edit receiver in list of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateReceiverDto: UpdateReceiverDto,
    @AuthUser() user: any,
  ) {
    return this.response(
      await this.receiverService.update(id, updateReceiverDto, user),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Edit receiver',
    description: 'Edit receiver in list of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @AuthUser() user: any) {
    return this.response(await this.receiverService.remove(id, user));
  }
}
