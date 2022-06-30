import { Field, InputType, Int } from "@nestjs/graphql";


@InputType()
export class TabEntry {
  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => Int)
  tabId: number;

  @Field(() => Int, {nullable: true})
  parentTabId: number;

  @Field(() => Int)
  degree: number;

  @Field(() => Int)
  rank: number;

  @Field()
  title: string;

  @Field()
  url: string;

  @Field()
  color: string;
}
