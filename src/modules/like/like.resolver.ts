import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { LikePostInput } from './dto/like.input';
import { LikeService } from './like.service';
import { LikeType } from './type/like.type';

@Resolver()
export class LikeResolver {
  constructor(private likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => LikeType)
  likePost(
    @CurrentUser() user: { id: string },
    @Args('data') data: LikePostInput,
  ) {
    return this.likeService.likePost(user.id, data.postId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  unlikePost(
    @CurrentUser() user: { id: string },
    @Args('postId') postId: string,
  ) {
    return this.likeService.unlikePost(user.id, postId);
  }
}
