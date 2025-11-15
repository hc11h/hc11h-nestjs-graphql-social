import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { NotificationService } from './notification.service';
import { Notification } from './types/notification.type';
import { MarkAsReadInput } from './dto/mark-as-read.input';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Notification])
  async notifications(
    @CurrentUser() user: { id: string },
    @Args('take', { defaultValue: 30 }) take: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ) {
    return this.notificationService.getUserNotifications(user.id, take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Notification])
  async unreadNotifications(
    @CurrentUser() user: { id: string },
    @Args('take', { defaultValue: 30 }) take: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ) {
    return this.notificationService.getUnreadNotifications(user.id, take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Number)
  async unreadCount(@CurrentUser() user: { id: string }) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async markAsRead(
    @CurrentUser() user: { id: string },
    @Args('input') input: MarkAsReadInput,
  ): Promise<boolean> {
    return this.notificationService.markAsRead(input.notificationId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async markAllAsRead(@CurrentUser() user: { id: string }): Promise<boolean> {
    return this.notificationService.markAllAsRead(user.id);
  }
}
