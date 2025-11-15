import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from 'src/modules/user/dto/user.type';

@ObjectType()
export class PostType {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  likeCount: number;

  @Field()
  commentCount: number;

  @Field()
  hotScore: number;

  @Field()
  createdAt: Date;

  @Field(() => UserType)
  author: UserType;
}
