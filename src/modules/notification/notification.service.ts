import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import EventEmitter from 'events';
import { Model } from 'mongoose';
import { fromEvent, filter } from 'rxjs';
import {
  Notification,
  NotificationDocument,
} from 'src/schemas/notification.schema';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class NotificationService {
  private readonly emitter = new EventEmitter();
  constructor(
    @InjectModel(Notification.name, 'users')
    private notificationModel: Model<NotificationDocument>,
    private readonly authService: AuthService,
  ) {}

  public async emit(data: NotificationDocument) {
    this.emitter.emit('liveNotification', { data });
  }

  public subscribeForUser(token: string) {
    const user = this.authService.validateToken(token);
    const source = fromEvent(this.emitter, 'liveNotification');
    return source.pipe(
      filter(({ data: liveNotification }) => liveNotification?.for == user.id),
    );
  }
}
