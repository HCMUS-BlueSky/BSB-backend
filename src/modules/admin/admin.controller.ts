import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { BaseController } from 'src/vendors/base';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
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

  @Get('/externalTransactions')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.ADMIN])
  @ApiOperation({
    summary: 'Get all external transactions (ADMIN ONLY)',
    description: 'Get all external transactions (ADMIN ONLY)',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'limit',
    default: 30,
    required: false,
    description: 'Limit number of days',
  })
  @ApiQuery({
    name: 'bank',
    required: false,
    description: 'Filter by selected bank',
  })
  async getExternalTransactions(
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
    @Query('bank') bank: string,
  ) {
    return this.response(
      await this.adminService.getExternalTransactions(limit, bank),
    );
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
