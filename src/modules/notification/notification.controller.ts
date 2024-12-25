import { Controller, Query, Sse } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('live-notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Sse()
  @ApiQuery({ name: 'token', required: true })
  public getEventsBySeller(@Query('token') token: string) {
    return this.notificationService.subscribeForUser(token);
  }
}
