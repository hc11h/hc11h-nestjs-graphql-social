import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('AuthUser')
export class AuthUserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;
}
