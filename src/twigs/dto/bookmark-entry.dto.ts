import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class BookmarkEntry {
  @Field()
  bookmarkId: string;

  @Field({ nullable: true })
  parentBookmarkId: string;

  @Field(() => Int)
  degree: number;

  @Field(() => Int)
  rank: number;

  @Field()
  title: string;

  @Field({ nullable: true})
  url: string;
}
