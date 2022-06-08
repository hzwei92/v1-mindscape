import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Arrow } from './arrow.entity';
import { v4 as uuidv4 } from 'uuid'; 
import { getEmptyDraft } from 'src/utils';
import { SearchService } from 'src/search/search.service';
import { SubsService } from 'src/subs/subs.service';
@Injectable()
export class ArrowsService {
  constructor(
    @InjectRepository(Arrow)
    private readonly arrowsRepository: Repository<Arrow>,
    private readonly subsService: SubsService,
    private readonly searchService: SearchService,
  ) {}

  async getArrowById(id: string) {
    return this.arrowsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getArrowByRouteName(routeName: string) {
    return this.arrowsRepository.findOne({
      where: {
        routeName,
      },
    });
  }

  async createArrow(user: User, abstract: Arrow | null, arrowId: string | null, draft: string | null) {
    const arrow0 = new Arrow();
    arrow0.id = arrowId || uuidv4();
    arrow0.userId = user.id;
    arrow0.abstractId = abstract?.id || arrow0.id;
    arrow0.draft = draft || getEmptyDraft();
    arrow0.routeName = arrow0.id;
    arrow0.color = user.color;
    arrow0.saveDate = new Date();
    const arrow1 = await this.arrowsRepository.save(arrow0);
    
    this.searchService.saveArrows([arrow1]);
    
    const sub = await this.subsService.createSub(user, arrow1);

    return {
      arrow: arrow1,
      sub,
    };
  }
}
