import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeResolver } from './like.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationsModule } from '../notification/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [LikeService, LikeResolver, PrismaService],
})
export class LikeModule {}
