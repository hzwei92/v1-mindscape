import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class CreateTabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  sibs: Twig[];
}
