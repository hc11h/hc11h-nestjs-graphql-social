import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class DeletePostInput {
  @Field()
  @IsString()
  postId: string;
}
