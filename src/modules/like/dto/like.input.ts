import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class LikePostInput {
  @Field()
  @IsString()
  postId: string;
}
