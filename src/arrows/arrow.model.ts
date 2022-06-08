import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Role } from 'src/roles/role.model';
import { Sub } from 'src/subs/sub.model';
import { User } from 'src/users/user.model';
import { Vote } from 'src/votes/vote.model';


@ObjectType()
export class Arrow {
  @Field()
  id: string;

  @Field()
  routeName: string;

  @Field()
  draft: string;

  @Field()
  text: string;

  @Field()
  color: string;

  @Field()
  isHold: boolean;

  @Field()
  isPin: boolean;


  @Field()
  userId: string;

  @Field(() => User)
  user: User;


  @Field({ nullable: true })
  sourceId: string;

  @Field(() => Arrow, { nullable: true })
  source: Arrow;

  @Field({ nullable: true })
  targetId: string;
  
  @Field(() => Arrow, { nullable: true })
  target: Arrow;


  @Field(() => [Arrow])
  ins: Arrow[];

  @Field(() => [Arrow])
  outs: Arrow[];
  
  @Field()
  inCount: number;

  @Field()
  outCount: number;


  @Field()
  abstractId: string;

  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => [Arrow])
  details: Arrow[];

  @Field()
  detailN: number;

  @Field()
  detailZ: number;


  @Field()
  canEdit: string;

  @Field()
  canPost: string;
  
  @Field()
  canTalk: string;  
  
  @Field()
  canHear: string;

  @Field()
  canView: string;



  @Field(() => [Sub])
  subs: Sub[];

  @Field(() => [Role])
  roles: Role[];
  
  @Field(() => [Vote])
  votes: Vote[];
  


  @Field(() => Float, { nullable: true })
  lng: number;

  @Field(() => Float, { nullable: true })
  lat: number;

  @Field({ nullable: true })
  city: string;

  @Field({ nullable: true })
  state: string;

  @Field({ nullable: true })
  country: string;



  @Field(() => Int)
  clicks: number;

  @Field(() => Float)
  coins: number;

  @Field(() => Float)
  weight: number;



  @Field()
  isOpaque: boolean;


  @Field()
  activeDate: Date;

  @Field()
  saveDate: Date;
  
  @Field({ nullable: true })
  commitDate: Date;

  @Field({ nullable: true })
  removeDate: Date;

  @Field()
  createDate: Date;
  
  @Field() 
  updateDate: Date;

  @Field()
  deleteDate: Date;
}