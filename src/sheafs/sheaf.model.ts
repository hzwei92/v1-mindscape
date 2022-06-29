import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class Sheaf {
  @Field()
  id: string;

  @Field()
  routeName: string;

  @Field({nullable: true})
  url: string;
  

  @Field()
  sourceId: string;

  @Field(() => Sheaf)
  source: Sheaf;

  @Field()
  targetId: string;
  
  @Field(() => Sheaf)
  target: Sheaf;


  @Field(() => [Sheaf])
  ins: Sheaf[];

  @Field(() => [Sheaf])
  outs: Sheaf[];
  
  @Field()
  inCount: number;

  @Field()
  outCount: number;

  
  @Field(() => [Arrow])
  arrows: Arrow[];


  @Field(() => Int)
  clicks: number;

  @Field(() => Float)
  tokens: number;

  @Field(() => Float)
  weight: number;


  @Field()
  createDate: Date;
  
  @Field() 
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}
