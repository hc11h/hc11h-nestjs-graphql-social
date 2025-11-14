import { NotFoundException, UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UserType } from './dto/user.type';

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => UserType, { name: 'me' })
  async me(@CurrentUser() user: { id: number }): Promise<UserType> {
    if (!user?.id) {
      throw new NotFoundException('Authenticated user not found');
    }

    const record = await this.userService.findById(user.id);
    if (!record) {
      throw new NotFoundException('User not found');
    }

    const { password, ...rest } = record;
    return rest as UserType;
  }
}

