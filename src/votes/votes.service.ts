import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { findDefaultWeight } from 'src/utils';
import { Not, Repository } from 'typeorm';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
  ) {}

  async getVotesByArrowId(arrowId: string): Promise<Vote[]> {
    return this.votesRepository.find({
      where: {
        arrowId,
      },
    });
  }

  async getVoteByUserIdAndLinkId(userId:string, arrowId: string): Promise<Vote> {
    return this.votesRepository.findOne({
      where: {
        userId,
        arrowId,
      }
    })
  }

  async createInitialVote(user: User, arrow: Arrow) {
    const vote0 = new Vote();
    vote0.userId = user.id;
    vote0.arrowId = arrow.id;
    return this.votesRepository.save(vote0);
  }
  
  async createVote(user: User, arrow: Arrow, clicks: number, tokens: number): Promise<Vote> {
    const vote0 = new Vote();
    vote0.userId = user.id;
    vote0.arrowId = arrow.id;
    vote0.clicks = clicks;
    vote0.tokens = tokens;
    vote0.weight = findDefaultWeight(clicks, tokens);
    return this.votesRepository.save(vote0);
  }

  async deleteVote(voteId: string) {
    const vote = await this.votesRepository.findOne({
      where: {
        id: voteId
      }
    });
    if (!vote) {
      throw new BadRequestException('This vote does not exist');
    }
    await this.votesRepository.softDelete({id: voteId});
  }
}
