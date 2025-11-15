import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserType } from 'src/modules/user/dto/user.type';
import { PostType } from 'src/modules/post/types/post.type';

export enum NotificationTypeEnum {
  FOLLOW = 'FOLLOW',
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
}

registerEnumType(NotificationTypeEnum, { name: 'NotificationType' });

@ObjectType('Notification')
export class Notification {
  @Field()
  id: string;

  @Field(() => NotificationTypeEnum)
  type: NotificationTypeEnum;

  @Field()
  read: boolean;

  @Field()
  createdAt: Date;

  @Field(() => UserType)
  actor: UserType;

  @Field(() => PostType, { nullable: true })
  post?: PostType | null;
}
