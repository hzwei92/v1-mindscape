import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Vote } from './vote.model';

@Resolver(() => Vote)
export class VotesResolver {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  getVoteUser(
    @Parent() vote: Vote,
  ) {
    return this.usersService.getUserById(vote.userId);
  }
}
