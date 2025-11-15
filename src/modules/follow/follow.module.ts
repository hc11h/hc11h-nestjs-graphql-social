import { Module } from '@nestjs/common';
import { FollowResolver } from './follow.resolver';
import { FollowService } from './follow.service';
import { NotificationsModule } from '../notification/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [FollowResolver, FollowService],
  exports: [FollowService],
})
export class FollowModule {}
