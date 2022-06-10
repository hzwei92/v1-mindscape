import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Arrow } from './arrow.model';
import { ArrowsService } from './arrows.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { SubsService } from 'src/subs/subs.service';
import { Sub } from 'src/subs/sub.model';
import { Role } from 'src/roles/role.model';
import { RolesService } from 'src/roles/roles.service';
import { VotesService } from 'src/votes/votes.service';
import { Vote } from 'src/votes/vote.model';
import { User as UserEntity } from 'src/users/user.entity';

@Resolver(() => Arrow)
export class ArrowsResolver {
  constructor(
    private readonly arrowsService: ArrowsService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly subsService: SubsService,
    private readonly votesService: VotesService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}
  
  @ResolveField(() => User, {name: 'user'})
  async getArrowUser(
    @Parent() arrow: Arrow,
  ) {
    return this.usersService.getUserById(arrow.userId);
  }
  
  @ResolveField(() => Arrow, {name: 'source', nullable: true})
  async getArrowSource(
    @Parent() arrow: Arrow,
  ) {
    if (!arrow.sourceId) return null;
    return this.arrowsService.getArrowById(arrow.sourceId);
  }

  @ResolveField(() => Arrow, {name: 'target', nullable: true})
  async getArrowTarget(
    @Parent() arrow: Arrow,
  ) {
    if (!arrow.targetId) return null;
    return this.arrowsService.getArrowById(arrow.targetId);
  }

  @ResolveField(() => Arrow, {name: 'abstract'})
  async getArrowAbstract(
    @Parent() arrow: Arrow,
  ) {
    return this.arrowsService.getArrowById(arrow.abstractId);
  }

  @ResolveField(() => [Role], {name: 'roles'})
  async getArrowRoles(
    @CurrentUser() user: UserEntity,
    @Parent() arrow: Arrow,
  ) {
    return this.rolesService.getRolesByArrowId(arrow.id);
  }

  @ResolveField(() => [Sub], {name: 'subs'})
  async getArrowSubs(
    @CurrentUser() user: UserEntity,
    @Parent() arrow: Arrow,
  ) {
    return this.subsService.getSubsByArrowId(arrow.id, false);
  }

  @ResolveField(() => [Vote], {name: 'votes'})
  async getArrowVotes(
    @CurrentUser() user: UserEntity,
    @Parent() arrow: Arrow,
  ) {
    return this.votesService.getVotesByArrowId(arrow.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Arrow, {name: 'getArrowByRouteName', nullable: true })
  async getArrowByRouteName(
    @Args('routeName') routeName: string,
  ) {
    return this.arrowsService.getArrowByRouteName(routeName);
  }
}
