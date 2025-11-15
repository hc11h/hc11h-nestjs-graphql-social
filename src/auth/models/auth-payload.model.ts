import { Field, ObjectType } from '@nestjs/graphql';
import { AuthUserType } from 'src/modules/user/dto/auth-user.type';
import { UserType } from 'src/modules/user/dto/user.type';

@ObjectType()
export class AuthPayload {
  @Field()
  access_token: string;

  @Field(() => UserType)
  user: AuthUserType;
}
