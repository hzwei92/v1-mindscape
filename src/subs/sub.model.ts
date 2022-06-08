import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Post } from 'src/posts/post.model';

@ObjectType()
export class Sub {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field()
  postId: string;

  @Field(() => Post)
  post: Post;
  
  @Field()
  createDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}