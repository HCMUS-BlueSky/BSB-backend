import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import EventEmitter from 'events';
import { Model } from 'mongoose';
import { fromEvent, filter } from 'rxjs';
import {
  Notification,
  NotificationDocument,
} from 'src/schemas/notification.schema';

@Injectable()
export class NotificationService {
  private readonly emitter = new EventEmitter();
  constructor(
    @InjectModel(Notification.name, 'users')
    private notificationModel: Model<NotificationDocument>,
  ) {}

  public async emit(data: NotificationDocument) {
    this.emitter.emit('liveNotification', { data });
  }

  public subscribeForUser(user: any) {
    const source = fromEvent(this.emitter, 'liveNotification');
    return source.pipe(
      filter(({ data: liveNotification }) => liveNotification?.for == user.id),
    );
  }
}
