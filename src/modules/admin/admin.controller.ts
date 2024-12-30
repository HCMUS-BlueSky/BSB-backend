import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { BaseController } from 'src/vendors/base';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ROLES } from 'src/common/constants';
import { IsForceLogin } from 'src/vendors/decorators';
import { Roles } from 'src/vendors/decorators/role.decorator';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController extends BaseController {
  constructor(private readonly adminService: AdminService) {
    super();
  }

  @Post('/registerBank')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.ADMIN])
  @ApiOperation({
    summary: 'Register external bank (ADMIN ONLY)',
    description: 'Register external bank (ADMIN ONLY)',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiBearerAuth()
  async create(@Body() createBankDto: CreateBankDto) {
    return this.response(await this.adminService.registerBank(createBankDto));
  }

  // @Get()
  // findAll() {
  //   return this.adminService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.adminService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //   return this.adminService.update(+id, updateAdminDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.adminService.remove(+id);
  // }
}
