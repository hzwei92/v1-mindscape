import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Role } from 'src/roles/role.model';
import { Sub } from 'src/subs/sub.model';
import { Twig } from 'src/twigs/twig.model';
import { User } from 'src/users/user.model';
import { Vote } from 'src/votes/vote.model';


@ObjectType()
export class Arrow {
  @Field()
  id: string;

  @Field()
  routeName: string;

  @Field({ nullable: true })
  draft: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  url: string;

  @Field({ nullable: true })
  title: string;

  @Field()
  color: string;


  @Field()
  userId: string;

  @Field(() => User)
  user: User;


  @Field()
  sourceId: string;

  @Field(() => Arrow)
  source: Arrow;

  @Field()
  targetId: string;
  
  @Field(() => Arrow)
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

  @Field(() => [Twig])
  twigs: Twig[];
  
  @Field()
  twigN: number;

  @Field()
  twigZ: number;

  @Field()
  rootTwigId: string;


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
  tokens: number;

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

  @Field({ nullable: true })
  deleteDate: Date;
}

@ObjectType()
export class ReplyTwigResult {
  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => Arrow)
  twig: Arrow;

  @Field(() => Arrow)
  link: Arrow;

  @Field(() => Role, { nullable: true })
  role: Role;
}