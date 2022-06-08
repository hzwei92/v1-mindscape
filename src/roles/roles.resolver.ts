import { Args, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Role } from './role.model';
import { RolesService } from './roles.service';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Post } from 'src/posts/post.model';
import { PostsService } from 'src/posts/posts.service';

@Resolver(() => Role)
export class RolesResolver {
  constructor(
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  async getRoleUser(
    @Parent() role: Role,
  ) {
    return this.usersService.getUserById(role.userId);
  }

  @ResolveField(() => Post, {name: 'post'})
  async getRolePost(
    @Parent() role: Role,
  ) {
    return this.postsService.getPostById(role.postId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'inviteRole'})
  async inviteRole(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('userName') userName: string,
    @Args('postId') postId: string,
  ) {
    const role = await this.rolesService.inviteRole(user.id, userName, postId);
    const post = await this.postsService.getPostById(postId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: role.userId,
      userRole: {
        ...role,
        user,
        post,
      }
    });

    this.pubSub.publish('postRole', {
      sessionId,
      postId,
      postRole: {
        ...role,
        user,
        post,
      },
    });

    return role;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'requestRole'})
  async requestRole(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('postId') postId: string,
  ) {
    const role = await this.rolesService.requestRole(user.id, postId)
    const post = await this.postsService.getPostById(postId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: user.id,
      userRole: {
        ...role,
        user,
        post,
      }
    });

    this.pubSub.publish('postRole', {
      sessionId,
      postId,
      postRole: {
        ...role,
        user,
        post
      },
    });

    return role;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'removeRole'})
  async removeRole(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
    @Args('roleId') roleId: string,
  ) {
    const role = await this.rolesService.removeRole(user.id, roleId)
    const removedUser = await this.usersService.getUserById(role.userId);
    const post = await this.postsService.getPostById(role.postId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: role.userId,
      userRole: {
        ...role,
        user: removedUser,
        post,
      }
    });

    this.pubSub.publish('postRole', {
      sessionId,
      postId: role.postId,
      postRole: {
        ...role,
        user: removedUser,
        post
      },
    });

    return role;
  }

  @Subscription(() => Role, {name: 'userRole',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.userId === variables.userId;
    }
  })
  userRoleSubscription(
    @Args('sessionId') sessionId: string,
    @Args('userId') userId: string,
  ) {
    return this.pubSub.asyncIterator('userRole')
  }
  @Subscription(() => Role, {name: 'postRole',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.postId === variables.postId;
    }
  })
  postRoleSubscription(
    @Args('sessionId') sessionId: string,
    @Args('postId') postId: string,
  ) {
    return this.pubSub.asyncIterator('postRole')
  }
}
