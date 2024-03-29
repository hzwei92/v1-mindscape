import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field({nullable: true})
  frameId: string;

  @Field(() => Arrow, {nullable: true})
  frame: Arrow;

  @Field({nullable: true})
  focusId: string;

  @Field(() => Arrow, {nullable: true})
  focus: Arrow;
  
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

  @Field()
  palette: string;

  @Field(() => Float, { nullable: true })
  mapLng: number;

  @Field(() => Float, { nullable: true })
  mapLat: number;

  @Field(() => Float, { nullable: true })
  mapZoom: number;

  @Field()
  isRegisteredWithGoogle: boolean;
  
  @Field({ nullable: true })
  verifyEmailDate: Date;

  @Field()
  isAdmin: boolean;
  
  @Field()
  activeDate: Date;

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