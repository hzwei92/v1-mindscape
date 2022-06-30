import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class WindowEntry {
  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  rank: number;
}
