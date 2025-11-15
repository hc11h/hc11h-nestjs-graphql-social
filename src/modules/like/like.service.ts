import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { calculateHotScore } from 'utils/hot-score';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypeEnum } from '../notification/types/notification.type';

@Injectable()
export class LikeService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deleted) {
      throw new BadRequestException('Post not found or deleted.');
    }

    const exists = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (exists) {
      throw new BadRequestException('Already liked.');
    }

    const like = await this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: { increment: 1 },
      },
    });

    const newHot = calculateHotScore(
      updatedPost.likeCount,
      updatedPost.createdAt,
    );

    await this.prisma.post.update({
      where: { id: postId },
      data: { hotScore: newHot },
    });

    if (userId !== post.authorId) {
      await this.notificationService.createNotification(
        NotificationTypeEnum.LIKE,
        userId,
        post.authorId,
        postId,
      );
    }

    return like;
  }

  async unlikePost(userId: string, postId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (!like) {
      throw new BadRequestException('Not liked yet.');
    }

    await this.prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });

    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: { decrement: 1 },
      },
    });

    const newHot = calculateHotScore(post.likeCount, post.createdAt);

    await this.prisma.post.update({
      where: { id: postId },
      data: { hotScore: newHot },
    });

    return true;
  }
}
