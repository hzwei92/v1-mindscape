import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Arrow } from 'src/arrows/arrow.model';
import { Role } from 'src/roles/role.model';

@ObjectType()
export class Twig {
  @Field()
  id: string

  @Field()
  userId: string;

  @Field(() => User)
  user: User;
  
  @Field()
  abstractId: string;

  @Field(() => Arrow)
  abstract: Arrow;

  @Field()
  detailId: string;
  
  @Field(() => Arrow)
  detail: Arrow;

  @Field(() => Arrow, {nullable: true})
  parent: Twig;

  @Field(() => [Twig])
  children: Twig[];

  @Field(() => Int)
  i: number;

  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;

  @Field(() => Int)
  z: number;

  @Field()
  isPinned: boolean;

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

  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => Role, { nullable: true })
  role: Role;
}

@ObjectType()
export class AddTwigResult {
  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => Twig)
  twig: Twig;

  @Field(() => Role, { nullable: true })
  role: Role;
}

@ObjectType()
export class RemoveTwigResult {
  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => Twig)
  parent: Twig;

  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => Role, { nullable: true })
  role: Role;
}


@ObjectType()
export class SelectTwigResult {
  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => Role, { nullable: true })
  role: Role;
}

@ObjectType()
export class DragTwigResult {
  @Field()
  twigId: string;

  @Field(() => Int)
  dx: number;

  @Field(() => Int)
  dy: number;
}

@ObjectType() 
export class MoveTwigResult {
  @Field(() => Twig)
  twig: Twig;
  
  @Field(() => Role, { nullable: true })
  role: Role;
}
