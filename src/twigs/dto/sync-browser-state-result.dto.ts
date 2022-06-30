import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class SyncBrowserStateResult {
  @Field(() => [Twig])
  bookmarks: Twig[];

  @Field(() => [Twig])
  windows: Twig[];

  @Field(() => [Twig])
  groups: Twig[];

  @Field(() => [Twig])
  tabs: Twig[];

  @Field(() => [Twig])
  deleted: Twig[];
}
