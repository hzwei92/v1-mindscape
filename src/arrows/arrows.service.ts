import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { Arrow } from './arrow.entity';
import { v4 } from 'uuid'; 
import { findDefaultWeight, getEmptyDraft, IdToType } from 'src/utils';
import { SearchService } from 'src/search/search.service';
import { SubsService } from 'src/subs/subs.service';
import { RoleType } from 'src/enums';
import { PRIVATE_ARROW_DRAFT, PRIVATE_ARROW_TEXT } from 'src/constants';
import { RolesService } from 'src/roles/roles.service';
import { TwigsService } from 'src/twigs/twigs.service';
import { VotesService } from 'src/votes/votes.service';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { Sheaf } from 'src/sheafs/sheaf.entity';
import { WindowEntry } from 'src/twigs/dto/window-entry.dto';
import { GroupEntry } from 'src/twigs/dto/group-entry.dto';
import { Entry, TabEntry } from 'src/twigs/dto/tab-entry.dto';
import { BookmarkEntry } from 'src/twigs/dto/bookmark-entry.dto';

@Injectable()
export class ArrowsService {
  constructor(
    @InjectRepository(Arrow)
    private readonly arrowsRepository: Repository<Arrow>,
    private readonly sheafsService: SheafsService,
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

  async getArrowByUserIdAndUrl(userId: string, url: string) {
    return this.arrowsRepository.findOne({
      where: {
        userId,
        url,
      },
    });
  }
  async getArrowsBySheafId(sheafId: string) {
    return this.arrowsRepository.find({
      where: {
        sheafId,
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

  async getArrowsByUserIdAndUrls(userId: string, urls: string[]) {
    return this.arrowsRepository.find({
      where: {
        userId,
        url: In(urls),
      },
    });
  }

  async createArrow(params: {
    user: User, 
    id: string | null, 
    sourceId: string | null, 
    targetId: string | null, 
    abstract: Arrow | null, 
    sheaf: Sheaf,
    draft: string | null,
    title: string | null,
    url: string | null,
    faviconUrl: string | null,
  }) {
    const {
      user,
      id,
      sourceId,
      targetId,
      abstract,
      sheaf,
      draft,
      title,
      url,
      faviconUrl,
    } = params;
    const arrow0 = new Arrow();
    arrow0.id = id || v4();
    arrow0.sourceId = sourceId;
    arrow0.targetId = targetId;
    arrow0.userId = user.id;
    arrow0.abstractId = abstract?.id || arrow0.id;
    arrow0.sheafId = sheaf.id;
    arrow0.draft = draft || getEmptyDraft();
    arrow0.title = title;
    arrow0.url = url;
    arrow0.faviconUrl = faviconUrl;
    arrow0.routeName = arrow0.id;
    arrow0.color = user.color;
    const arrow1 = await this.arrowsRepository.save(arrow0);

    if (sourceId && targetId) {
      await this.incrementOutCount(sourceId, 1);
      await this.incrementInCount(targetId, 1);
    }

    const [twig] = await this.twigsService.createRootTwigs(user, [arrow1]);

    arrow1.rootTwigId = twig.id;

    const arrow2 = await this.arrowsRepository.save(arrow1);

    this.searchService.saveArrows([arrow2]);

    const [vote] = await this.votesService.createInitialVotes(user, [arrow2]);
    
    const [sub] = await this.subsService.createSubs(user, [arrow2]);

    return {
      arrow: arrow2,
      vote,
      twig,
      sub,
    };
  }

  async saveArrows(arrows: Arrow[]) {
    return this.arrowsRepository.save(arrows);
  }

  async linkArrows(user: User, abstract: Arrow, sourceId: string, targetId: string) {
    const source = await this.arrowsRepository.findOne({
      where: {
        id: sourceId,
      },
    });
    if (!source) {
      throw new BadRequestException('This source arrow does not exist');
    }

    const target = await this.arrowsRepository.findOne({
      where: {
        id: targetId,
      },
    });
    if (!target) {
      throw new BadRequestException('This target arrow does not exist');
    }

    let arrow = await this.arrowsRepository.findOne({
      where: {
        userId: user.id,
        sourceId,
        targetId,
      },
    });

    let isPreexisting;
    let vote;
    let sheaf = await this.sheafsService.getSheafBySourceIdAndTargetId(source.sheafId, target.sheafId)
    if (arrow) {
      isPreexisting = true;

      if (sheaf) {
        sheaf = await this.sheafsService.incrementWeight(sheaf, 1, 0);
      }
      else {
        sheaf = await this.sheafsService.createSheaf(source.sheafId, target.sheafId, null);
      }
      
      arrow.clicks += 1;
      arrow.weight = findDefaultWeight(arrow.clicks, arrow.tokens);
      arrow = await this.arrowsRepository.save(arrow);

      vote = await this.votesService.createVote(user, arrow, 1, 0);
    }
    else {
      isPreexisting = false;

      if (sheaf) {
        sheaf = await this.sheafsService.incrementWeight(sheaf, 1, 0);
      }
      else {
        sheaf = await this.sheafsService.createSheaf(source.sheafId, target.sheafId, null);
      }

      ({ arrow, vote } = await this.createArrow({
        user, 
        id: null, 
        sourceId, 
        targetId, 
        abstract, 
        sheaf, 
        draft: null, 
        title: null, 
        url: null,
        faviconUrl: null,
      }));
    }
    return {
      sheaf,
      arrow,
      vote,
      isPreexisting,
    }
  }

  async loadWindowArrows(user: User, abstract: Arrow, windows: WindowEntry[]) {
    let arrows = [];
    let sheafs = [];
    windows.forEach(entry => {
      const sheaf = new Sheaf();
      sheaf.id = v4();
      sheaf.routeName = sheaf.id;
      sheafs.push(sheaf);

      const arrow = new Arrow();
      arrow.id = entry.arrowId;
      arrow.userId = user.id;
      arrow.sheafId = sheaf.id;
      arrow.abstractId = abstract.id;
      arrow.title = 'Window ' + entry.windowId;
      arrow.routeName = arrow.id;
      arrow.color = user.color;
      arrows.push(arrow);
    });
    await this.sheafsService.saveSheafs(sheafs);
    arrows = await this.arrowsRepository.save(arrows);
    await this.finishArrows(user, arrows);
  }

  async loadGroupArrows(user: User, abstract: Arrow, groups: GroupEntry[]) {
    let sheafs = [];
    let arrows = []
    groups.forEach(entry => {
      const sheaf = new Sheaf();
      sheaf.id = v4();
      sheaf.routeName = sheaf.id;
      sheafs.push(sheaf);

      const arrow = new Arrow();
      arrow.id = entry.arrowId;
      arrow.userId = user.id;
      arrow.sheafId = sheaf.id;
      arrow.abstractId = abstract.id;
      arrow.title = 'Group ' + entry.groupId.toString();
      arrow.routeName = arrow.id;
      arrow.color = user.color;
      arrows.push(arrow);
    });
    await this.sheafsService.saveSheafs(sheafs);
    arrows = await this.arrowsRepository.save(arrows);
    await this.finishArrows(user, arrows);
  }

  async loadTabArrows(user: User, abstract: Arrow, entries: (TabEntry | Entry | BookmarkEntry)[]) {
    const existingArrows = await this.getArrowsByUserIdAndUrls(user.id, entries.map(entry => entry.url));
    
    const urlToArrow: IdToType<Arrow> = existingArrows.reduce((acc, arrow) => {
      acc[arrow.url] = arrow;
      return acc;
    }, {})

    const urlToEntry: IdToType<TabEntry | Entry | BookmarkEntry> = entries.reduce((acc, entry) => {
      acc[entry.url] = entry;
      return acc;
    }, {});

    let sheafs = [];
    let arrows = [];
    Object.keys(urlToEntry).forEach(url => {
      const entry = urlToEntry[url];

      let arrow = urlToArrow[url];

      if (arrow) {
        entry.arrowId = arrow.id;
      }
      else {
        const sheaf = new Sheaf();
        sheaf.id = v4();
        sheaf.routeName = sheaf.id;
        sheafs.push(sheaf);
  
        arrow = new Arrow();
        arrow.id = entry.arrowId;
        arrow.userId = user.id;
        arrow.sheafId = sheaf.id;
        arrow.abstractId = abstract.id;
        arrow.title = entry.title;
        arrow.url = entry.url;
        arrow.faviconUrl = entry.faviconUrl
        arrow.routeName = arrow.id;
        arrow.color = user.color;
        arrows.push(arrow);

        urlToArrow[arrow.url] = arrow;
      }
    });

    await this.sheafsService.saveSheafs(sheafs);
    arrows = await this.arrowsRepository.save(arrows);
    await this.finishArrows(user, arrows);

    return entries;
  }

  async loadBookmarkArrows(user: User, abstract: Arrow, entries: BookmarkEntry[]) {
    const urlEntries: BookmarkEntry[] = [];
    const nonUrlEntries: BookmarkEntry[] = [];
    entries.forEach(entry => {
      if (entry.url) {
        urlEntries.push(entry);
      }
      else {
        nonUrlEntries.push(entry);
      }
    });

    const urlEntries1 = await this.loadTabArrows(user, abstract, urlEntries) as BookmarkEntry[];

    const sheafs = [];
    let arrows = [];
    nonUrlEntries.forEach(entry => {
      const sheaf = new Sheaf();
      sheaf.id = v4();
      sheaf.routeName = sheaf.id;
      sheafs.push(sheaf);

      const arrow = new Arrow();
      arrow.id = entry.arrowId;
      arrow.sourceId = arrow.id;
      arrow.targetId = arrow.id;
      arrow.userId = user.id;
      arrow.sheafId = sheaf.id;
      arrow.abstractId = abstract.id;
      arrow.title = entry.title;
      arrow.url = entry.url;
      arrow.routeName = arrow.id;
      arrow.color = user.color;
      arrows.push(arrow);
    });

    await this.sheafsService.saveSheafs(sheafs);
    arrows = await this.arrowsRepository.save(arrows);
    await this.finishArrows(user, arrows);
    return [...urlEntries1, ...nonUrlEntries];
  }

  async finishArrows(user: User, arrows: Arrow[]) {
    const twigs = await this.twigsService.createRootTwigs(user, arrows);

    const detailIdToTwigId = twigs.reduce((acc, twig) => {
      acc[twig.detailId] = twig.id;
      return acc;
    }, {});

    arrows.forEach(arrow => {
      arrow.rootTwigId = detailIdToTwigId[arrow.id];
    });

    const arrows1 = await this.arrowsRepository.save(arrows);

    this.searchService.saveArrows(arrows1);


    await this.votesService.createInitialVotes(user, arrows1);
    await this.subsService.createSubs(user, arrows1);

    return arrows1
  }

  async incrementInCount(id: string, value: number) {
    await this.arrowsRepository.increment({ id }, 'inCount', value);
  }

  async incrementOutCount(id: string, value: number) {
    await this.arrowsRepository.increment({ id }, 'outCount', value);
  }

  async incrementTwigN(id: string, value: number) {
    await this.arrowsRepository.increment({id}, 'twigN', value);
  }

  async incrementTwigZ(id: string, value: number) {
    await this.arrowsRepository.increment({id}, 'twigZ', value);
  }
}
