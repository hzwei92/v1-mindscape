import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class RemoveTabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  children: Twig[];

  @Field(() => [Twig])
  descs: Twig[];

  @Field(() => [Twig])
  sibs: Twig[];

  @Field(() => [Twig])
  sheafs: Twig[];
}