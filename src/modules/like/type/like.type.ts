import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class LikeType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  postId: string;

  @Field()
  createdAt: Date;
}
