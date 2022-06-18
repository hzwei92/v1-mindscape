import { Inject, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { UsersService } from 'src/users/users.service';
import { 
  AddTwigResult,
  DragTwigResult,
  GroupEntry,
  LinkTwigsResult,
  MoveTwigResult,
  OpenTwigResult,
  RemoveGroupTwigResult,
  RemoveTabTwigResult,
  RemoveTwigResult,
  RemoveWindowTwigResult,
  ReplyTwigResult,
  SelectTwigResult, 
  TabEntry, 
  Twig,
  WindowEntry,
} from './twig.model';
import { TwigsService } from './twigs.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { User } from 'src/users/user.model';
import { User as UserEntity } from 'src/users/user.entity';

@Resolver(() => Twig)
export class TwigsResolver {
  constructor(
    private readonly twigsService: TwigsService,
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub
  ) {}

  @ResolveField(() => Twig, {name: 'parent', nullable: true})
  async getTwigParent(
    @Parent() twig: Twig,
  ) {
    return this.twigsService.getTwigByChildId(twig.id);
  }

  @ResolveField(() => [Twig], {name: 'children'})
  async getTwigChildren() {
    return [];
  }

  @ResolveField(() => User, {name: 'user'})
  async getTwigUser(
    @Parent() twig: Twig,
  ) {
    return this.usersService.getUserById(twig.userId);
  }

  @ResolveField(() => Arrow, {name: 'detail'})
  async getTwigDetail(
    @CurrentUser() user: UserEntity,
    @Parent() twig: Twig,
  ) {
    return this.arrowsService.getArrowByIdWithPrivacy(user, twig.detailId);
  }
  
  @ResolveField(() => Arrow, {name: 'abstract'})
  async getTwigAbstract(
    @Parent() twig: Twig,
  ) {
    return this.arrowsService.getArrowById(twig.abstractId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'getTwigs'})
  async getTwigs(
    @Args('abstractId') abstractId: string,
  ) {
    return this.twigsService.getTwigsByAbstractId(abstractId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReplyTwigResult, {name: 'replyTwig'})
  async replyTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
    @Args('postId') postId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
    @Args('draft') draft: string,
  ) {
    return this.twigsService.replyTwig(user, parentTwigId, twigId, postId, x, y, draft);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LinkTwigsResult, {name: 'linkTwigs'})
  async linkTwigs(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('sourceId') sourceId: string,
    @Args('targetId') targetId: string,
  ) {
    const {
      abstract,
      twig,
      source,
      target,
      role,
    } = await this.twigsService.linkTwigs(user, abstractId, sourceId, targetId);

    return {
      abstract,
      twig,
      source,
      target,
      role,
    };
  }
  @UseGuards(GqlAuthGuard)
  @Mutation(() => AddTwigResult, {name: 'addTwig'})
  async addTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('arrowId') arrowId: string,
  ) {
    throw new Error('Not yet implemented')
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveTwigResult, {name: 'removeTwig'})
  async removeTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
  ) {
    const { 
      //abstract,
      parentTwig,
      twigs,
      role,
    } = await this.twigsService.removeTwig(user, twigId);

    return {
      //abstract,
      parentTwig,
      twigs,
      role,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SelectTwigResult, {name: 'selectTwig'})
  async selectTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
  ) {
    const {
      abstract,
      twigs,
      role
    } = await this.twigsService.selectTwig(user, twigId);

    return { 
      abstract,
      twigs,  
      role
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Twig, {name: 'dragTwig'})
  async dragTwig(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('twigId') twigId: string,
    @Args('dx', {type: () => Int}) dx: number,
    @Args('dy', {type: () => Int}) dy: number,
  ) {
    this.pubSub.publish('dragTwig', {
      sessionId,
      abstractId,
      dragTwig: {
        twigId,
        dx,
        dy,
      }
    });
    return {
      id: twigId,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => MoveTwigResult, {name: 'moveTwig'})
  async moveTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
    @Args('shouldMoveSubtree') shouldMoveSubtree: boolean,
  ) {
    const {
      twigs, 
      role,
    } = await this.twigsService.moveTwig(user, twigId, x, y, shouldMoveSubtree);

    return {
      twigs, 
      role,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => OpenTwigResult, {name: 'graftTwig'})
  async graftTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('targetTwigId') targetTwigId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    const { 
      twig,
      role
    } = await this.twigsService.graftTwig(user, twigId, targetTwigId, x, y);

    return {
      twig,
      role,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'adjustTwigs'})
  async adjustTwig(
    @CurrentUser() user: UserEntity,
    @Args('abstractId') abstractId: string,
    @Args('twigIds', {type: () => [String]}) twigIds: string[],
    @Args('xs', {type: () => [Int]}) xs: number[],
    @Args('ys', {type: () => [Int]}) ys: number[],
  ) {
    return this.twigsService.adjustTwigs(user, abstractId, twigIds, xs, ys);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => OpenTwigResult, {name: 'openTwig'})
  async openTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('isOpen') isOpen: boolean,
  ) {
    const { 
      twig,
      role
    } = await this.twigsService.openTwig(user, twigId, isOpen);

    return {
      twig,
      role,
    };
  }


  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'loadTabs'})
  async loadTabs(
    @CurrentUser() user: UserEntity,
    @Args('windows', {type: () => [WindowEntry]}) windows: WindowEntry[],
    @Args('groups', {type: () => [GroupEntry]}) groups: GroupEntry[],
    @Args('tabs', {type: () => [TabEntry]}) tabs: TabEntry[],
  ) {
    console.log('loadTabs', windows, groups, tabs);
    return this.twigsService.loadTabs(user, windows, groups, tabs);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'createTab'})
  async createTab(
    @CurrentUser() user: UserEntity,
    @Args('tab', {type: () => TabEntry, nullable: true}) tab: TabEntry,
  ) {
    console.log('createTab', tab)
    return this.twigsService.createTab(user, tab);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'createGroup'})
  async createGroup(
    @CurrentUser() user: UserEntity,
    @Args('group', {type: () => GroupEntry}) group: GroupEntry,
    @Args('window', {type: () => WindowEntry, nullable: true}) window: WindowEntry,
    @Args('tab', {type: () => TabEntry, nullable: true}) tab: TabEntry,
    @Args('tabTwigId', {nullable: true}) tabTwigId: string,
  ) {
    console.log('createGroup', group, tab, window)
    return this.twigsService.createGroup(user, group, window, tab, tabTwigId);
  }
  
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Twig, {name: 'updateTab'})
  async updateTab(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
    @Args('title') title: string,
    @Args('url') url: string,
  ) {
    return this.twigsService.updateTab(user, twigId, title, url);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'moveTab'})
  async moveTab(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
    @Args('windowId', { type: () => Int }) windowId: number,
    @Args('groupId', { type: () => Int }) groupId: number,
    @Args('parentTabId', {type: () => Int, nullable: true}) parentTabId: number,
  ) {
    console.log('moveTab', twigId, groupId, parentTabId);
    return this.twigsService.moveTab(user, twigId, windowId, groupId, parentTabId);
  }




  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveTabTwigResult, {name: 'removeTabTwig'})
  async removeTabTwig(
    @CurrentUser() user: UserEntity,
    @Args('tabId', {type: () => Int}) tabId: number,
  ) {
    return this.twigsService.removeTabTwig(user, tabId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveGroupTwigResult, {name: 'removeGroupTwig'})
  async removeGroupTwig(
    @CurrentUser() user: UserEntity,
    @Args('groupId', {type: () => Int}) groupId: number,
  ) {
    return this.twigsService.removeGroupTwig(user, groupId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveWindowTwigResult, {name: 'removeWindowTwig'})
  async removeWindowTwig(
    @CurrentUser() user: UserEntity,
    @Args('windowId', {type: () => Int}) windowId: number,
  ) {
    return this.twigsService.removeWindowTwig(user, windowId);
  }




  @Subscription(() => AddTwigResult, {name: 'addTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  addTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('addTwigSub');
    return this.pubSub.asyncIterator('addTwig')
  }

  @Subscription(() => SelectTwigResult, {name: 'selectTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  selectTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('selectTwigSub');
    return this.pubSub.asyncIterator('selectTwig')
  }

  @Subscription(() => RemoveTwigResult, {name: 'removeTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  removeTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('removeTwigSub');
    return this.pubSub.asyncIterator('removeTwig')
  }

  @Subscription(() => DragTwigResult, {name: 'dragTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  dragTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('dragTwigSub');
    return this.pubSub.asyncIterator('dragTwig')
  }

  @Subscription(() => Twig, {name: 'moveTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  moveTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('moveTwigSub');
    return this.pubSub.asyncIterator('moveTwig')
  }

  @Subscription(() => Twig, {name: 'graftTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  graftTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('graftTwigSub');
    return this.pubSub.asyncIterator('graftTwig')
  }
}
