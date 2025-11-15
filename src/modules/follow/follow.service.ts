import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { FollowType } from './types/follow.type';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existing = await this.prisma.follow.findFirst({
      where: { followerId, followingId },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Already following this user');
    }

    await this.prisma.follow.create({
      data: { followerId, followingId },
    });
  }

  async unfollowUser(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const result = await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
    return result.count > 0;
  }

  async getFollowers(
    userId: string,
    take: number,
    skip: number,
  ): Promise<FollowType[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.followerId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });

    const pairs = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      followerCount: u._count.followers,
      followingCount: u._count.following,
      postCount: u._count.posts,
    }));

    const byId = new Map(pairs.map((user) => [user.id, user]));

    return rows.map((r) => ({
      user: byId.get(r.followerId)!,
      followedAt: r.createdAt,
    }));
  }

  async getFollowing(
    userId: string,
    take: number,
    skip: number,
  ): Promise<FollowType[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.followingId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });

    const pairs = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      followerCount: u._count.followers,
      followingCount: u._count.following,
      postCount: u._count.posts,
    }));

    const byId = new Map(pairs.map((user) => [user.id, user]));

    return rows.map((r) => ({
      user: byId.get(r.followingId)!,
      followedAt: r.createdAt,
    }));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow: { id: string } | null = await this.prisma.follow.findFirst({
      where: { followerId, followingId },
      select: { id: true },
    });
    return !!follow;
  }
}
