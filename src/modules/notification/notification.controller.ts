import { Controller, Sse, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/vendors/guards/auth.guard';
import { AuthUser, IsForceLogin } from 'src/vendors/decorators';

@Controller('live-notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Sse()
  @ApiBearerAuth()
  @IsForceLogin(true)
  @ApiBearerAuth()
  public getEventsBySeller(@AuthUser() user: any) {
    return this.notificationService.subscribeForUser(user);
  }
}
