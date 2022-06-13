import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { Arrow } from './arrow.entity';
import { v4 } from 'uuid'; 
import { getEmptyDraft } from 'src/utils';
import { SearchService } from 'src/search/search.service';
import { SubsService } from 'src/subs/subs.service';
import { RoleType } from 'src/enums';
import { PRIVATE_ARROW_DRAFT, PRIVATE_ARROW_TEXT, uuidRegexExp } from 'src/constants';
import { RolesService } from 'src/roles/roles.service';
import { TwigsService } from 'src/twigs/twigs.service';
import { VotesService } from 'src/votes/votes.service';
import { TwigEntry } from 'src/twigs/twig.model';

@Injectable()
export class ArrowsService {
  constructor(
    @InjectRepository(Arrow)
    private readonly arrowsRepository: Repository<Arrow>,
    private readonly votesService: VotesService,
    private readonly twigsService: TwigsService,
    private readonly rolesService: RolesService,
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

  async getArrowByIdWithPrivacy(user: User, id: string) {
    const arrow = await this.arrowsRepository.findOne({
      where: {
        id,
      },
      relations: ['abstract']
    });
    if (!arrow) {
      throw new BadRequestException('This arrow does not exist');
    }
    if (arrow.abstract.canView !== RoleType.OTHER) {
      const role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, arrow.abstractId);
      if (
        !role ||
        (arrow.abstract.canView === RoleType.MEMBER && role.type !== RoleType.ADMIN && role.type !== RoleType.MEMBER) ||
        (arrow.abstract.canView === RoleType.ADMIN && role.type !== RoleType.ADMIN)
      ) {
        arrow.text = PRIVATE_ARROW_TEXT;
        arrow.draft = PRIVATE_ARROW_DRAFT;
        arrow.isOpaque = true;
      }
    }
    return arrow;
  }

  async getArrowByRouteName(routeName: string) {
    return this.arrowsRepository.findOne({
      where: {
        routeName,
      },
    });
  }

  async getArrowsByUrls(urls: string[]) {
    return this.arrowsRepository.find({
      where: {
        url: In(urls),
      },
    });
  }

  async createArrow(
    user: User, 
    arrowId: string | null, 
    sourceId: string, 
    targetId: string, 
    abstract: Arrow | null, 
    draft: string | null,
  ) {
    const arrow0 = new Arrow();
    arrow0.id = arrowId || v4();
    arrow0.sourceId = sourceId;
    arrow0.targetId = targetId;
    arrow0.userId = user.id;
    arrow0.abstractId = abstract?.id || arrow0.id;
    arrow0.draft = draft || getEmptyDraft();
    arrow0.routeName = arrow0.id;
    arrow0.color = user.color;
    const arrow1 = await this.arrowsRepository.save(arrow0);
    
    this.searchService.saveArrows([arrow1]);

    const [vote] = await this.votesService.createInitialVotes(user, [arrow1]);

    const [twig] = await this.twigsService.createRootTwigs(user, [arrow1]);
    
    const [sub] = await this.subsService.createSubs(user, [arrow1]);

    return {
      arrow: arrow1,
      vote,
      twig,
      sub,
    };
  }

  async loadArrows(user: User, abstract: Arrow, entries: TwigEntry[]) {
    const nonURLEntries: TwigEntry[] = [];
    const urlToEntry = entries.reduce((acc, entry) => {
      if (entry.url !== null) {
        acc[entry.url] = entry;
      }
      else {
        nonURLEntries.push(entry);
      }
      return acc;
    }, {});
    const arrows = await this.getArrowsByUrls(Object.keys(urlToEntry));
    const urlToTrue = arrows.reduce((acc, arrow) => {
      acc[arrow.url] = true;
      return acc;
    }, {});

    const URLEntries: TwigEntry[] = Object.keys(urlToEntry)
      .filter(url => !urlToTrue[url])
      .map(url => urlToEntry[url]); 

    const arrows0 = [...nonURLEntries, ...URLEntries]
      .map(entry => {
        const arrow0 = new Arrow();
        arrow0.id = v4();
        arrow0.sourceId = arrow0.id;
        arrow0.targetId = arrow0.id;
        arrow0.userId = user.id;
        arrow0.abstractId = abstract.id;
        arrow0.title = entry.title 
          ? entry.title
          : entry.groupId
            ? 'group:' + entry.groupId
            : 'window:' + entry.windowId;
        arrow0.url = entry.url
        arrow0.color = user.color;
        arrow0.routeName = arrow0.id;
        return arrow0;
      });

    const arrows1 = await this.arrowsRepository.save(arrows0);

    this.searchService.saveArrows(arrows1);

    await this.votesService.createInitialVotes(user, arrows1);
    await this.twigsService.createRootTwigs(user, arrows1);
    await this.subsService.createSubs(user, arrows1);

    return [...arrows, ...arrows1];
  }

  async incrementInCount(id: string, value: number) {
    await this.arrowsRepository.increment({id}, 'inCount', value);
  }

  async incrementOutCount(id: string, value: number) {
    await this.arrowsRepository.increment({id}, 'outCount', value);
  }

  async incrementTwigN(id: string, value: number) {
    await this.arrowsRepository.increment({id}, 'twigN', value);
  }

  async incrementTwigZ(id: string, value: number) {
    await this.arrowsRepository.increment({id}, 'twigZ', value);
  }
}
