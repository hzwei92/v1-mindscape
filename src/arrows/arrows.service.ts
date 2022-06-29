import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { Arrow } from './arrow.entity';
import { v4 } from 'uuid'; 
import { findDefaultWeight, getEmptyDraft } from 'src/utils';
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

  async createArrow(
    user: User, 
    arrowId: string | null, 
    sourceId: string | null, 
    targetId: string | null, 
    abstract: Arrow | null, 
    sheaf: Sheaf,
    draft: string | null,
    title: string | null,
    url: string | null,
  ) {
    const arrow0 = new Arrow();
    arrow0.id = arrowId || v4();
    arrow0.sourceId = sourceId || arrow0.id;
    arrow0.targetId = targetId || arrow0.id;
    arrow0.userId = user.id;
    arrow0.abstractId = abstract?.id || arrow0.id;
    arrow0.sheafId = sheaf.id;
    arrow0.draft = draft || getEmptyDraft();
    arrow0.title = title;
    arrow0.url = url;
    arrow0.routeName = arrow0.id;
    arrow0.color = user.color;
    const arrow1 = await this.arrowsRepository.save(arrow0);
    

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
        sheaf = await this.sheafsService.createSheaf(sourceId, targetId, null);
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
        sheaf = await this.sheafsService.createSheaf(sourceId, targetId, null);
      }

      ({ arrow, vote } = await this.createArrow(user, null, sourceId, targetId, abstract, sheaf, null, null, null));
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
      sheaf.sourceId = sheaf.id;
      sheaf.targetId = sheaf.id;
      sheaf.routeName = sheaf.id;
      sheafs.push(sheaf);

      const arrow = new Arrow();
      arrow.id = v4();
      arrow.sourceId = arrow.id;
      arrow.targetId = arrow.id;
      arrow.userId = user.id;
      arrow.sheafId = sheaf.id;
      arrow.abstractId = abstract.id;
      arrow.title = 'window ' + entry.windowId.toString();
      arrow.routeName = arrow.id;
      arrow.color = user.color;
      arrows.push(arrow);
    });
    await this.sheafsService.saveSheafs(sheafs);
    arrows = await this.arrowsRepository.save(arrows);
    return this.finishArrows(user, arrows);
  }

  async loadGroupArrows(user: User, abstract: Arrow, groups: GroupEntry[]) {
    let sheafs = [];
    let arrows = []
    groups.forEach(entry => {
      const sheaf = new Sheaf();
      sheaf.id = v4();
      sheaf.sourceId = sheaf.id;
      sheaf.targetId = sheaf.id;
      sheaf.routeName = sheaf.id;
      sheafs.push(sheaf);

      const arrow = new Arrow();
      arrow.id = v4();
      arrow.sourceId = arrow.id;
      arrow.targetId = arrow.id;
      arrow.userId = user.id;
      arrow.sheafId = sheaf.id;
      arrow.abstractId = abstract.id;
      arrow.title = 'group ' + entry.groupId.toString();
      arrow.routeName = arrow.id;
      arrow.color = user.color;
      arrows.push(arrow);
    });
    await this.sheafsService.saveSheafs(sheafs);
    arrows = await this.arrowsRepository.save(arrows);
    return this.finishArrows(user, arrows);
  }

  async loadTabArrows(user: User, abstract: Arrow, tabs: {url: string, title: string}[]) {
    const urlToTab = {};
    const nonUrlTabs = [];
    tabs.forEach(entry => {
      if (entry.url) {
        urlToTab[entry.url] = entry;
      }
      else {
        nonUrlTabs.push(entry);
      }
    });

    const arrows = await this.getArrowsByUserIdAndUrls(user.id, Object.keys(urlToTab));
    const urlToArrow = arrows.reduce((acc, arrow) => {
      acc[arrow.url] = arrow;
      return acc;
    }, {});

    let sheafs = await this.sheafsService.getSheafsByUrls(Object.keys(urlToTab));
    const urlToSheaf = sheafs.reduce((acc, sheaf) => {
      acc[sheaf.url] = sheaf;
      return acc;
    }, {});

    const readyArrows = []
    let updateArrows = [];
    let createSheafs = [];
    let createArrows = [];

    const urlTabs = Object.keys(urlToTab || {}).map(url => urlToTab[url]);

    [...nonUrlTabs, ...urlTabs].forEach(entry => {
      let arrow = urlToArrow[entry.url];
      if (arrow) {
        if (arrow.title === entry.title) {
          readyArrows.push(arrow);
        }
        else {
          arrow.title = entry.title;
          updateArrows.push(arrow);
        }
      }
      else {
        let sheaf;
        if (entry.url && urlToSheaf[entry.url]) {
          sheaf = urlToSheaf[entry.url];
        }
        else {
          sheaf = new Sheaf();
          sheaf.id = v4();
          sheaf.sourceId = sheaf.id;
          sheaf.targetId = sheaf.id;
          sheaf.routeName = sheaf.id;
          sheaf.url = entry.url;
          createSheafs.push(sheaf);
        }
        arrow = new Arrow();
        arrow.id = v4();
        arrow.sourceId = arrow.id;
        arrow.targetId = arrow.id;
        arrow.userId = user.id;
        arrow.sheafId = sheaf.id;
        arrow.abstractId = abstract.id;
        arrow.title = entry.title;
        arrow.url = entry.url;
        arrow.routeName = arrow.id;
        arrow.color = user.color;
        createArrows.push(arrow);
      }
    });

    updateArrows = await this.arrowsRepository.save(updateArrows);
    await this.sheafsService.saveSheafs(createSheafs);
    createArrows = await this.arrowsRepository.save(createArrows);
    createArrows = await this.finishArrows(user, createArrows);
    return [...readyArrows, ...updateArrows, ...createArrows];
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
