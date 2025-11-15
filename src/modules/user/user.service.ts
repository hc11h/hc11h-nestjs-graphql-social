import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: RegisterUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
      },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserCoreData(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        followers: true,
        following: true,
        posts: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      postCount: user.posts.length,
    };
  }

  async getFollowers(userId: string, take: number = 10, skip: number = 0) {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      skip,
      take,
      include: {
        follower: true,
      },
    });

    return followers.map((f) => {
      const { password, ...rest } = f.follower;
      return rest;
    });
  }

  async getFollowing(userId: string, take: number = 10, skip: number = 0) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      skip,
      take,
      include: {
        following: true,
      },
    });

    return following.map((f) => {
      const { password, ...rest } = f.following;
      return rest;
    });
  }

  async getPosts(userId: string, take: number = 10, skip: number = 0) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      skip,
      take,
      include: {
        likes: true,
        notifications: true,
      },
    });

    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      likeCount: post.likes.length,
      notificationCount: post.notifications.length,
    }));
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
