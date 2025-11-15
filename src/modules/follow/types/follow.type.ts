import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from 'src/modules/user/dto/user.type';

@ObjectType()
export class FollowType {
  @Field(() => UserType)
  user: UserType;

  @Field()
  followedAt: Date;
}
