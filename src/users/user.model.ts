import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/posts/post.model';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field({nullable: true})
  frameId: string;

  @Field(() => Post, {nullable: true})
  frame: Post;

  @Field({nullable: true})
  focusId: string;

  @Field(() => Post, {nullable: true})
  focus: Post;

  @Field(() => Int)
  postN: number;
  
  @Field(() => Int)
  voteN: number;
  
  @Field(() => Int)
  deletedVoteN: number;
  
  @Field()
  name: string;

  @Field()
  lowercaseName: string;

  @Field()
  routeName: string;

  @Field({ nullable: true })
  email: string;

  @Field()
  description: string;

  @Field()
  color: string;

  @Field({ nullable: true })
  mapLng: number;

  @Field({ nullable: true })
  mapLat: number;

  @Field({ nullable: true })
  mapZoom: number;

  @Field()
  isRegisteredWithGoogle: boolean;
  
  @Field({ nullable: true })
  verifyEmailDate: Date;

  @Field()
  isAdmin: boolean;
  
  @Field()
  lastActiveDate: Date;

  @Field()
  createDate: Date;

  @Field()
  updateDate: Date;

  @Field({nullable: true})
  deleteDate: Date;
}

@ObjectType()
export class UserCursor {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  color: string;

  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;
}