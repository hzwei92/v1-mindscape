import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class Sheaf {
  @Field()
  id: string;

  @Field()
  routeName: string;


  @Field()
  sourceId: string;

  @Field(() => Arrow)
  source: Arrow;

  @Field()
  targetId: string;
  
  @Field(() => Arrow)
  target: Arrow;


  @Field(() => [Arrow])
  links: Arrow[];


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
