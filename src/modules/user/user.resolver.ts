import { NotFoundException, UseGuards } from '@nestjs/common';
import { Resolver, Args, Parent, ResolveField, Query } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { UserType } from './dto/user.type';
import { AuthUserType } from './dto/auth-user.type';

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => AuthUserType, { name: 'me' })
  async me(@CurrentUser() user: { id: string }): Promise<AuthUserType> {
    const userRecord = await this.userService.findUserById(user.id);

    if (!userRecord) throw new NotFoundException('User not found');

    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
    };
  }

  @Query(() => UserType, { name: 'user' })
  async getUser(@CurrentUser() currentUser: { id: string }): Promise<UserType> {
    const record = await this.userService.getUserCoreData(currentUser.id);
    if (!record) throw new NotFoundException('User not found');
    return record;
  }

  @ResolveField(() => [UserType])
  async followers(
    @Parent() user: UserType,
    @Args('take', { type: () => Number, defaultValue: 10 }) take: number,
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
  ) {
    return this.userService.getFollowers(user.id, take, skip);
  }

  @ResolveField(() => [UserType])
  async following(
    @Parent() user: UserType,
    @Args('take', { type: () => Number, defaultValue: 10 }) take: number,
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
  ) {
    return this.userService.getFollowing(user.id, take, skip);
  }

  @ResolveField(() => [UserType])
  async posts(
    @Parent() user: UserType,
    @Args('take', { type: () => Number, defaultValue: 10 }) take: number,
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
  ) {
    return this.userService.getPosts(user.id, take, skip);
  }
}
