import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from 'src/vendors/base';
import { AccountInfoDto } from './dto/account-info.dto';
import { ExternalAccountInfoDto } from './dto/external-account-info.dto';

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

  @Post('/info')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get user info by account number or email',
    description: 'Get user info by account number or email',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getUserInfoByAccountNumberOrEmail(
    @Body() accountInfoDto: AccountInfoDto,
  ) {
    return this.response(
      await this.accountService.getUserInfoByAccountNumberOrEmail(
        accountInfoDto,
      ),
    );
  }

  @Post('/external/info')
  @HttpCode(HttpStatus.OK)
  @IsForceLogin(true)
  @ApiOperation({
    summary: 'Get external user info by account number',
    description: 'Get external user info by account number',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getExternalUserInfoByAccountNumber(
    @Body() externalAccountInfoDto: ExternalAccountInfoDto,
  ) {
    return this.response(
      await this.accountService.getExternalAccountInfo(
        externalAccountInfoDto.accountNumber,
        externalAccountInfoDto.bankId,
      ),
    );
  }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
