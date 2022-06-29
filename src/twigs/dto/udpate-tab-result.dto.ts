import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class UpdateTabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  deleted: Twig[];
}