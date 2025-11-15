import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationTypeEnum } from './types/notification.type';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(
    type: NotificationTypeEnum,
    actorId: string,
    recipientId: string,
    postId?: string,
  ): Promise<void> {
    if (actorId === recipientId) return;

    await this.prisma.notification.create({
      data: {
        type,
        actorId,
        recipientId,
        postId,
      },
    });
  }

  async getUserNotifications(userId: string, take = 30, skip = 0) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { actor: true, post: true },
    });
  }

  async getUnreadNotifications(userId: string, take = 30, skip = 0) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId, read: false },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { actor: true, post: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { recipientId: userId, read: false },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { recipientId: true, read: true },
    });

    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.recipientId !== userId)
      throw new ForbiddenException('Not allowed');
    if (notif.read) return true;

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return true;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });
    return true;
  }
}
