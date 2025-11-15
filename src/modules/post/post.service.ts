import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { calculateHotScore } from 'utils/hot-score';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(authorId: string, content: string, imageUrl?: string) {
    const post = await this.prisma.post.create({
      data: {
        authorId,
        content,
        imageUrl,
      },
    });

    const hotScore = calculateHotScore(0, post.createdAt);

    return this.prisma.post.update({
      where: { id: post.id },
      data: { hotScore },
      include: { author: true },
    });
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new NotFoundException('Post not found');

    if (post.authorId !== userId)
      throw new ForbiddenException('Not allowed to delete');

    await this.prisma.post.update({
      where: { id: postId },
      data: { deleted: true },
    });

    return true;
  }

  async getUserPosts(userId: string, take: number, skip: number) {
    return this.prisma.post.findMany({
      where: { authorId: userId, deleted: false },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { author: true },
    });
  }

  async getExploreFeed(take: number, skip: number) {
    return this.prisma.post.findMany({
      where: { deleted: false },
      orderBy: { hotScore: 'desc' },
      take,
      skip,
      include: { author: true },
    });
  }

  async getFollowingFeed(userId: string, take: number, skip: number) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const ids = following.map((f) => f.followingId);
    if (ids.length === 0) return [];

    return this.prisma.post.findMany({
      where: { authorId: { in: ids }, deleted: false },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { author: true },
    });
  }
}
