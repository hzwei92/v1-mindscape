import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Arrow } from 'src/arrows/arrow.model';
import { Role } from 'src/roles/role.model';
import { Sheaf } from 'src/sheafs/sheaf.model';

@ObjectType()
export class Twig {
  @Field()
  id: string;

  @Field({ nullable: true })
  sourceId: string;

  @Field(() => Twig, { nullable: true })
  source: Twig;

  @Field({ nullable: true })
  targetId: string;

  @Field(() => Twig, { nullable: true })
  target: Twig;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;
  
  @Field()
  abstractId: string;

  @Field(() => Arrow)
  abstract: Arrow;

  @Field({ nullable: true })
  detailId: string;
  
  @Field(() => Arrow, { nullable: true })
  detail: Arrow;

  @Field({nullable: true})
  sheafId: string;

  @Field(() => Sheaf, {nullable: true})
  sheaf: Sheaf;

  @Field()
  isRoot: boolean;

  @Field(() => Int)
  i: number;

  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;

  @Field(() => Int)
  z: number;
  
  @Field({ nullable: true })
  color: string;

  @Field()
  isOpen: boolean;

  @Field(() => Arrow, {nullable: true})
  parent: Twig;

  @Field(() => [Twig])
  children: Twig[];

  @Field(() => Int)
  degree: number;

  @Field(() => Int)
  rank: number;

  @Field()
  displayMode: string;

  @Field(() => Int, { nullable: true })
  windowId: number;

  @Field(() => Int, { nullable: true })
  groupId: number;

  @Field(() => Int, { nullable: true })
  tabId: number;

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
export class LinkTwigsResult {
  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => Twig)
  twig: Twig;

  @Field(() => Arrow)
  source: Arrow;

  @Field(() => Arrow)
  target: Arrow;

  @Field(() => Role, {nullable: true})
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
  @Field(() => [Twig])
  twigs: Twig[];
  
  @Field(() => Role, { nullable: true })
  role: Role;
}

@ObjectType() 
export class OpenTwigResult {
  @Field(() => Twig)
  twig: Twig;
  
  @Field(() => Role, { nullable: true })
  role: Role;
}

@InputType()
export class WindowEntry {
  @Field()
  twigId: string;

  @Field()
  parentTwigId: string;

  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  rank: number;
}

@InputType()
export class GroupEntry {
  @Field()
  twigId: string;

  @Field()
  parentTwigId: string;

  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => Int)
  rank: number;

  @Field()
  color: string;
}

@InputType()
export class TabEntry {
  @Field()
  twigId: string;

  @Field()
  parentTwigId: string;

  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => Int)
  tabId: number;

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

@ObjectType()
export class SyncTabStateResult {
  @Field(() => [Twig])
  windows: Twig[];

  @Field(() => [Twig])
  groups: Twig[];

  @Field(() => [Twig])
  tabs: Twig[];

  @Field(() => [Twig])
  deleted: Twig[];
}

@ObjectType()
export class CreateTabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  sibs: Twig[];
}

@ObjectType()
export class UpdateTabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  deleted: Twig[];
}

@ObjectType()
export class MoveTabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  prevSibs: Twig[];

  @Field(() => [Twig])
  sibs: Twig[];

  @Field(() => [Twig])
  descs: Twig[];
}

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