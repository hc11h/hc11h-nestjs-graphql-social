import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FollowService } from './follow.service';
import { FollowUserInput } from './dto/follow-user.input';
import { UnfollowUserInput } from './dto/unfollow-user.input';
import { FollowType } from './types/follow.type';

@Resolver()
export class FollowResolver {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async followUser(
    @CurrentUser() user: { id: string },
    @Args('input') input: FollowUserInput,
  ): Promise<boolean> {
    await this.followService.followUser(user.id, input.targetUserId);
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async unfollowUser(
    @CurrentUser() user: { id: string },
    @Args('input') input: UnfollowUserInput,
  ): Promise<boolean> {
    return this.followService.unfollowUser(user.id, input.targetUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [FollowType])
  async followers(
    @CurrentUser() user: { id: string },
    @Args('take', { defaultValue: 10 }) take: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ): Promise<FollowType[]> {
    return this.followService.getFollowers(user.id, take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [FollowType])
  async following(
    @CurrentUser() user: { id: string },
    @Args('take', { defaultValue: 10 }) take: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ): Promise<FollowType[]> {
    return this.followService.getFollowing(user.id, take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  async isFollowing(
    @CurrentUser() user: { id: string },
    @Args('targetUserId') targetUserId: string,
  ): Promise<boolean> {
    return this.followService.isFollowing(user.id, targetUserId);
  }
}
