import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from 'src/vendors/base';

@Controller('account')
@UseGuards(AuthGuard)
export class AccountController extends BaseController {
  constructor(private readonly accountService: AccountService) {
    super();
  }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get bank account information',
    description: 'Get bank account inforamation of current logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getProfile(@AuthUser() user: any) {
    return this.response(await this.accountService.getAccount(user));
  }

  @Get(':accountNumber/info')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get user info by account number',
    description: 'Get user info by account number',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getUserInfoByAccountNumber(
    @Param('accountNumber') accountNumber: string,
  ) {
    return this.response(
      await this.accountService.getUserInfoByAccountNumber(accountNumber),
    );
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
