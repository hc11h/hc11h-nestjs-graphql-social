import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostService } from './post.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreatePostInput } from './dto/create-post.input';
import { DeletePostInput } from './dto/delete-post.input';
import { PostType } from './types/post.type';

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => PostType)
  async createPost(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreatePostInput,
  ) {
    return this.postService.createPost(user.id, input.content, input.imageUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async deletePost(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeletePostInput,
  ): Promise<boolean> {
    return this.postService.deletePost(input.postId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [PostType])
  async myPosts(
    @CurrentUser() user: { id: string },
    @Args('take', { defaultValue: 10 }) take: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ) {
    return this.postService.getUserPosts(user.id, take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [PostType])
  async exploreFeed(
    @Args('take', { defaultValue: 10 }) take: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ) {
    return this.postService.getExploreFeed(take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [PostType])
  async followingFeed(
    @CurrentUser() user: { id: string },
    @Args('take', { defaultValue: 10 }) take: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ) {
    return this.postService.getFollowingFeed(user.id, take, skip);
  }
}
