import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Arrow } from 'src/arrows/arrow.model';
import { Role } from 'src/roles/role.model';

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

  @Field()
  detailId: string;
  
  @Field(() => Arrow)
  detail: Arrow;

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

  @Field(() => Int, { nullable: true })
  index: number;

  @Field(() => Int)
  degree: number;

  @Field(() => Int)
  rank: number;

  @Field(() => Int)
  ownWidth: number;

  @Field(() => Int)
  ownHeight: number;

  @Field(() => Int)
  width: number;

  @Field(() => Int)
  height: number;

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
  @Field({ nullable: true})
  twigId: string;

  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  rank: number;
}

@InputType()
export class GroupEntry {
  @Field({ nullable: true })
  twigId: string;

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
  @Field({ nullable: true})
  twigId: string;

  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  groupId: number;

  @Field({ nullable: true })
  parentTabId: number;

  @Field(() => Int)
  tabId: number;

  @Field(() => Int)
  index: number;

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
export class CreateGroupResult {
  @Field(() => Twig, {nullable: true})
  window: Twig;

  @Field(() => [Twig])
  windowSibs: Twig[];

  @Field(() => Twig)
  group: Twig;

  @Field(() => [Twig])
  groupSibs: Twig[];

  @Field(() => Twig)
  tab: Twig;

  @Field(() => [Twig])
  tabDescs: Twig[];

}

@ObjectType()
export class UpdateTabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  deleted: Twig[];
}

@ObjectType()
export class RemoveTabTwigResult {
  @Field(() => Twig)
  tab: Twig;

  @Field(() => [Twig])
  tabChildren: Twig[];

  @Field(() => [Twig])
  tabDescs: Twig[];

  @Field(() => [Twig])
  tabSibs: Twig[];

  @Field(() => [Twig])
  tabLinks: Twig[];
}

@ObjectType()
export class RemoveGroupTwigResult {
  @Field(() => Twig)
  group: Twig;

  @Field(() => [Twig])
  groupSibs: Twig[];
}

@ObjectType()
export class RemoveWindowTwigResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  sibs: Twig[];
}