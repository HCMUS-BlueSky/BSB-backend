import {
  Controller,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { IsForceLogin } from 'src/vendors/decorators';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from 'src/vendors/base';
import { RegisterRequestDto } from '../auth/dto/auth.dto';
import { AuthService } from '../auth/auth.service';
import { RolesGuard } from 'src/vendors/guards/role.guard';
import { Roles } from 'src/vendors/decorators/role.decorator';
import { ROLES } from 'src/common/constants';
import { TopUpAccountDto } from './dto/topup-account.dto';
import { AccountHistoryDto } from './dto/account-history.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employee')
@UseGuards(AuthGuard, RolesGuard)
export class EmployeeController extends BaseController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.ADMIN])
  @ApiOperation({
    summary: 'Get list of employees (ADMIN ONLY)',
    description: 'Get list of employees (ADMIN ONLY)',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getAllEmployee() {
    return this.response(await this.employeeService.getAllEmployee());
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.ADMIN])
  @ApiOperation({
    summary: 'Update employee info (ADMIN ONLY)',
    description: 'Update employee info (ADMIN ONLY)',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.response(
      await this.employeeService.update(id, updateEmployeeDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.ADMIN])
  @ApiOperation({
    summary: 'Delete employee (ADMIN ONLY)',
    description: 'Delete employee (ADMIN ONLY)',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.response(await this.employeeService.remove(id));
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @IsForceLogin(true)
  @Roles([ROLES.ADMIN])
  @ApiOperation({
    summary: 'Register employee account (ADMIN ONLY)',
    description: 'Register employee account (ADMIN ONLY)',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiBearerAuth()
  async registerEmployee(@Body() registerRequestDto: RegisterRequestDto) {
    return this.response(
      await this.employeeService.register(registerRequestDto),
    );
  }

  @Post('registerUser')
  @HttpCode(HttpStatus.CREATED)
  @IsForceLogin(true)
  @Roles([ROLES.EMPLOYEE, ROLES.ADMIN])
  @ApiOperation({
    summary: 'Register account',
    description: 'Register user account with email, username and password',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiBearerAuth()
  async registerUser(@Body() registerRequestDto: RegisterRequestDto) {
    return this.response(await this.authService.register(registerRequestDto));
  }

  @Post('topup')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.EMPLOYEE, ROLES.ADMIN])
  @ApiOperation({
    summary: 'Top up user account',
    description: 'Top up user account with amount',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async topUp(@Body() topUpAccountDto: TopUpAccountDto) {
    return this.response(
      await this.employeeService.topUpAccount(topUpAccountDto),
    );
  }

  @Post('accountHistory')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.EMPLOYEE, ROLES.ADMIN])
  @ApiOperation({
    summary: 'Top up user account',
    description: 'Top up user account with amount',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async history(@Body() accountHistoryDto: AccountHistoryDto) {
    return this.response(
      await this.employeeService.getAccountHistory(accountHistoryDto),
    );
  }

  @Get('accountList')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.EMPLOYEE, ROLES.ADMIN])
  @ApiOperation({
    summary: 'Top up user account',
    description: 'Top up user account with amount',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getAccountList() {
    return this.response(await this.employeeService.getAccountList());
  }

  @Get('account/:id')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @Roles([ROLES.EMPLOYEE, ROLES.ADMIN])
  @ApiOperation({
    summary: 'Get user account by id',
    description: 'Get user account by id',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getAccountById(@Param('id') id: string) {
    return this.response(await this.employeeService.getAccountById(id));
  }
  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get('me')
  // @HttpCode(HttpStatus.OK)
  // @IsForceLogin(true)
  // @ApiOperation({
  //   summary: 'Get user information',
  //   description: 'Get information of currently logged in user',
  // })
  // @ApiResponse({ status: 200, description: 'Success' })
  // @ApiBearerAuth()
  // async getProfile(@AuthUser() user: any) {
  //   return this.response(await this.employeeService.getProfile(user));
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
