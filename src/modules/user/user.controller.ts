import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from 'src/vendors/base';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
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
    summary: 'Get user information',
    description: 'Get information of currently logged in user',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiBearerAuth()
  async getProfile(@AuthUser() user: any) {
    return this.response(await this.userService.getProfile(user));
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user information',
    description: 'Update address and date of birth for the currently logged-in user',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiBearerAuth()
  async updateProfile(
    @AuthUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.response(await this.userService.updateProfile(user.id, updateUserDto));
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
