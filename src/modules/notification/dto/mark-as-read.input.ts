import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class MarkAsReadInput {
  @Field()
  @IsUUID()
  @IsString()
  notificationId: string;
}
