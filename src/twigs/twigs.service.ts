import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { uuidRegexExp } from 'src/constants';
import { ArrowsService } from 'src/arrows/arrows.service';
import { RolesService } from 'src/roles/roles.service';
import { In, IsNull, MoreThanOrEqual, Not, QueryRunner, Repository } from 'typeorm';
import { Twig } from './twig.entity';
import { DisplayMode, RoleType } from '../enums';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';
import { VotesService } from 'src/votes/votes.service';
import { checkPermit } from 'src/utils';
import { WindowEntry, GroupEntry, TabEntry } from './twig.model';

@Injectable()
export class TwigsService {
  constructor (
    @InjectRepository(Twig) 
    private readonly twigsRepository: Repository<Twig>,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
    private readonly votesService: VotesService,
    private readonly rolesService: RolesService,
  ) {}

  async getTwigById(id: string): Promise<Twig> {
    return this.twigsRepository.findOne({ 
      where: {
        id 
      }
    });
  }

  async getTwigWithSiblingsById(id: string): Promise<Twig> {
    return this.twigsRepository.findOne({ 
      where: {
        id 
      },
      relations: ['parent', 'parent.children'],
    });
  }

  async getTwigsByIds(ids: string[]) {
    return this.twigsRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async getRootTwigByAbstractId(abstractId: string) {
    return this.twigsRepository.findOne({
      where: {
        abstractId,
        isRoot: true,
      }
    });
  }

  async getTwigsByAbstractId(abstractId: string): Promise<Twig[]> {
    const twigs = await this.twigsRepository.find({
      where: {
        abstractId,
      },
    });
    return twigs
  }

  async getTwigByAbstractIdAndDetailId(abstractId: string, detailId: string): Promise<Twig> {
    const twig = await this.twigsRepository.findOne({
      where: {
        abstractId,
        detailId,
      },
    });
    return twig;
  }

  async getTwigByChildId(childId: string): Promise<Twig> {
    const child = await this.twigsRepository.findOne({
      where: {
        id: childId,
      },
      relations: ['parent'],
    });
    return child?.parent;
  }

  async getTwigWithChildrenByUserIdAndTabId(userId: string, tabId: number) {
    return this.twigsRepository.findOne({
      where: {
        userId,
        tabId,
      },
      relations: ['children'],
    });
  }

  async getGroupTwigsByUserIdAndWindowId(userId: string, windowId: number) {
    return this.twigsRepository.find({
      where: {
        userId,
        windowId,
        groupId: Not(IsNull()),
        tabId: IsNull(),
      }
    })
  }

  async getTwigWithChildrenByUserIdAndGroupId(userId: string, groupId: number) {
    return this.twigsRepository.findOne({
      where: {
        userId,
        groupId,
        tabId: IsNull(),
      },
      relations: ['children'],
    });
  }


  async getTwigByUserIdAndWindowId(userId: string, windowId: number) {
    return this.twigsRepository.findOne({
      where: {
        userId,
        windowId,
        groupId: IsNull(),
        tabId: IsNull(),
      },
    });
  }

  async createRootTwigs(user: User, arrows: Arrow[]) {
    const twigs0 = arrows.map(arrow => {
      const twig0 = new Twig();
      twig0.userId = user.id;
      twig0.abstractId = arrow.id;
      twig0.detailId = arrow.id;
      twig0.degree = 0;
      twig0.rank = 0;
      twig0.isRoot = true;
      return twig0;
    })
    return this.twigsRepository.save(twigs0);
  }

  async createTwig(
    user: User,
    abstract: Arrow, 
    detail: Arrow, 
    parentTwig: Twig | null, 
    twigId: string | null, 
    i: number,
    x: number,
    y: number,
    z: number,
    isOpen: boolean,
  ) {
    const twig0 = new Twig();
    twig0.id = twigId || undefined;
    twig0.userId = user.id;
    twig0.abstractId = abstract.id;
    twig0.detailId = detail.id;
    twig0.parent = parentTwig;
    twig0.i = i;
    twig0.x = x
    twig0.y = y
    twig0.z = z;
    twig0.isOpen = isOpen;
    return this.twigsRepository.save(twig0);
  }

  async replyTwig(user: User, parentTwigId: string, twigId: string, postId: string, x: number, y: number, draft: string) {
    if (!uuidRegexExp.test(twigId)) {
      throw new BadRequestException('Twig ID must be valid uuid')
    }
    if (!uuidRegexExp.test(postId)) {
      throw new BadRequestException('Post ID must be valid uuid')
    }

    const parentTwig = await this.twigsRepository.findOne({
      where: {
        id: parentTwigId,
      },
      relations: ['abstract', 'detail']
    });
    if (!parentTwig) {
      throw new BadRequestException('This parent twig does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, parentTwig.abstractId);
    let role1 = null;
    if (checkPermit(parentTwig.abstract.canPost, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, parentTwig.abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const existingTwig = await this.getTwigById(twigId);
    if (existingTwig) {
      throw new BadRequestException('This Twig ID is already in use')
    }
    const existingArrow = await this.arrowsService.getArrowById(postId);
    if (existingArrow) {
      throw new BadRequestException('This Post ID is already in use')
    }

    const { arrow: post } = await this.arrowsService.createArrow(
      user, 
      postId, 
      postId, 
      postId, 
      parentTwig.abstract, 
      draft,
    );
    const { arrow: link } = await this.arrowsService.createArrow(
      user, 
      null, 
      parentTwig.detailId, 
      post.id, 
      parentTwig.abstract, 
      null,
    )
    const postTwig = await this.createTwig(
      user,
      parentTwig.abstract,
      post,
      parentTwig,
      twigId,
      parentTwig.abstract.twigN + 1,
      x,
      y,
      parentTwig.abstract.twigZ + 1,
      true,
    );
    const linkTwig = await this.createTwig(
      user,
      parentTwig.abstract,
      link,
      null,
      null,
      parentTwig.abstract.twigN + 2,
      Math.round((parentTwig.x + x) / 2),
      Math.round((parentTwig.y + y) / 2),
      parentTwig.abstract.twigZ + 2,
      false,
    );
    await this.arrowsService.incrementTwigN(parentTwig.abstractId, 2);
    await this.arrowsService.incrementTwigZ(parentTwig.abstractId, 2);
    const abstract = await this.arrowsService.getArrowById(parentTwig.abstractId);
    return {
      abstract,
      twigs: [postTwig, linkTwig],
      role: role1,
    };
  }

  async removeTwig(user: User, twigId: string) {
    const twig = await this.twigsRepository.findOne({
      where: {
        id: twigId
      },
      relations: ['parent']
    });

    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const date = new Date();
    const descendants = await this.twigsRepository.manager.getTreeRepository(Twig).findDescendants(twig);
    const twigs0 = descendants.map(twig => {
      const twig0 = new Twig();
      twig0.id = twig.id;
      twig0.abstractId = twig.abstractId;
      twig0.detailId = twig.detailId;
      twig0.deleteDate = date;
      return twig0;
    })
    const twigs1 = await this.twigsRepository.save(twigs0);
    //const abstract1 = await this.arrowsService.updateArrow(abstract.id);

    return {
      //abstract: abstract1,
      parentTwig: twig.parent,
      twigs: twigs1,
      role: role1,
    };
  }

  async selectTwig(user: User, twigId: string) {
    const twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const descendants = await this.twigsRepository.manager.getTreeRepository(Twig).findDescendants(twig);

    const baseZ = twig.detailId === abstract.id
      ? 0
      : abstract.twigZ;

    const twigs0 = descendants.map((twig, i) => {
      const twig0 = new Twig();
      twig0.id = twig.id;
      if (twig.id === twigId) {
        twig0.z = baseZ + descendants.length + 1;    
      }
      else {
        twig0.z = baseZ + i + 1;
      }
      return twig0;
    });

    const twigs1 = await this.twigsRepository.save(twigs0);

    const twigZ = baseZ + descendants.length + 1 - abstract.twigZ;

    await this.arrowsService.incrementTwigZ(abstract.id, twigZ);
    const abstract1 = await this.arrowsService.getArrowById(abstract.id);
    return {
      abstract: abstract1,
      twigs: twigs1,
      role: role1,
    }
  }

  async linkTwigs(user: User, abstractId: string, sourceId: string, targetId: string) {
    const abstract = await this.arrowsService.getArrowById(abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canView, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const source = await this.arrowsService.getArrowById(sourceId);
    if (!source) {
      throw new BadRequestException('This source does not exist');
    }
    const target = await this.arrowsService.getArrowById(targetId);
    if (!target) {
      throw new BadRequestException('This target does not exist');
    }
    const sourceTwig = await this.getTwigByAbstractIdAndDetailId(abstract.id, source.id);
    if (!sourceTwig) {
      throw new BadRequestException('This sourceTwig does not exist');
    }
    const targetTwig = await this.getTwigByAbstractIdAndDetailId(abstract.id, target.id);
    if (!targetTwig) {
      throw new BadRequestException('This targetTwig does not exist');
    }

    const { arrow } = await this.arrowsService.createArrow(user, null, sourceId, targetId, abstract, null);

    await this.arrowsService.incrementOutCount(source.id, 1);
    await this.arrowsService.incrementInCount(target.id, 1);
    
    const source1 = await this.arrowsService.getArrowById(source.id);
    const target1 = await this.arrowsService.getArrowById(target.id);

    const x = Math.round((sourceTwig.x + targetTwig.x) / 2);
    const y = Math.round((sourceTwig.y + targetTwig.y) / 2);

    const twig = await this.createTwig(user, abstract, arrow, null, null, abstract.twigN + 1, x, y, abstract.twigZ + 1, true);
  
    await this.arrowsService.incrementTwigN(abstract.id, 1);
    await this.arrowsService.incrementTwigZ(abstract.id, 1);

    const abstract1 = await this.arrowsService.getArrowById(abstract.id);

    return {
      abstract: abstract1,
      twig,
      source: source1,
      target: target1,
      role: role1,
    }
  }

  async moveTwig(user: User, twigId: string, x: number, y: number) {
    const twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const dx = x - twig.x;
    const dy = y - twig.y;

    const descendants = await this.twigsRepository.manager.getTreeRepository(Twig).findDescendants(twig);

    const twigs0 = descendants.map(descendant => {
      const twig0 = new Twig();
      twig0.id = descendant.id;
      twig0.x = descendant.x + dx;
      twig0.y = descendant.y + dy;
      return twig0;
    })
    const twigs1 = await this.twigsRepository.save(twigs0);

    return {
      twigs: twigs1,
      role: role1,
    }
  }

  async graftTwig(user: User, twigId: string, targetTwigId: string, x: number, y: number) {
    const twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const targetTwig = await this.getTwigById(targetTwigId)
    if (!targetTwig) {
      throw new BadRequestException('This target twig does not exist');
    }
    if (twig.abstractId !== targetTwig.abstractId) {
      throw new BadRequestException('Cannot graft twig into new abstract')
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const twig0 = new Twig();
    twig0.id = twigId;
    twig0.parent = targetTwig;
    twig0.x = x;
    twig0.y = y;
    const twig1 = await this.twigsRepository.save(twig0);

    return {
      twig: twig1,
      role: role1,
    }
  }

  async adjustTwigs(user: User, abstractId: string,  twigIds: string[], xs: number[], ys: number[]) {
    if (twigIds.length !== xs.length || twigIds.length !== ys.length) {
      throw new BadRequestException('Invalid input');
    }
    const abstract = await this.arrowsService.getArrowById(abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist')
    }

    const role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);

    if (!checkPermit(abstract.canEdit, role?.type)) {
      throw new BadRequestException('Insufficient privileges');
    }

    const twigs = await this.getTwigsByIds(twigIds);
    if (twigs.length !== twigIds.length) {
      throw new BadRequestException('Invalid Twig IDs');
    }

    twigs.forEach(twig => {
      if (twig.abstractId !== abstractId) {
        throw new BadRequestException('Invalid abstract ID')
      }
    });

    const twigs0 = twigs.map((twig, i) => {
      const twig0 = new Twig();
      twig0.id = twig.id;
      twig0.x = xs[i];
      twig0.y = ys[i];
      return twig0;
    });

    return this.twigsRepository.save(twigs0);
  }

  async openTwig(user: User, twigId: string, isOpen: boolean) {
    const twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist')
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const twig0 = new Twig();
    twig0.id = twig.id;
    twig0.isOpen = isOpen;
    const twig1 = await this.twigsRepository.save(twig0);

    return {
      twig: twig1,
      role: role1,
    }
  }

  async loadWindowTwigs(user: User, windows: WindowEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);
    const rootTwig = await this.getRootTwigByAbstractId(user.frameId);

    const arrows = await this.arrowsService.loadWindowArrows(user, abstract, windows);
    const windowIdToArrow = arrows.reduce((acc, arrow) => {
      acc[arrow.title] = arrow;
      return acc;
    }, {});

    const windows0 = windows.map((entry, i) => {
      const dx = Math.random() - 0.5;
      const dy = Math.random() - 0.5;
      const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const x = Math.round(400 * (dx / dr));
      const y = Math.round(400 * (dy / dr));
  
      const window0 = new Twig();
      window0.userId = user.id;
      window0.abstractId = abstract.id;
      window0.detailId = windowIdToArrow[entry.windowId].id;
      window0.parent = rootTwig;
      window0.i = abstract.twigN + i + 1;
      window0.x = x;
      window0.y = y;
      window0.z = abstract.twigZ + i + 1;
      window0.windowId = entry.windowId;
      window0.degree = 1;
      window0.rank = entry.rank;
      window0.displayMode = DisplayMode.VERTICAL;
      return window0;
    });
    const windows1 = await this.twigsRepository.save(windows0);
    await this.arrowsService.incrementTwigN(abstract.id, windows.length);
    await this.arrowsService.incrementTwigZ(abstract.id, windows.length);

    return windows1;
  }

  async loadGroupTwigs(user: User, groups: GroupEntry[], windowIdToTwig: any) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);
    const arrows = await this.arrowsService.loadGroupArrows(user, abstract, groups);
    const groupIdToArrow = arrows.reduce((acc, arrow) => {
      acc[arrow.title] = arrow;
      return acc;
    }, {});

    const groups0 = groups.map((entry, i) => {
      const parentTwig = windowIdToTwig[entry.windowId];

      if (!parentTwig) {
        console.error(entry);
        throw new Error('Missing group parentTwig');
      }
      const dx = parentTwig.x
      const dy = parentTwig.y
      const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const dx1 = Math.random() - 0.5;
      const dy1 = Math.random() - 0.5;
      const dr1 = Math.sqrt(Math.pow(dx1, 2) + Math.pow(dy1, 2));
      const x = Math.round((400 * (dx / dr)) + (400 * (dx1 / dr1)) + parentTwig.x);
      const y = Math.round((400 * (dy / dr)) + (400 * (dy1 / dr1)) + parentTwig.y);
  
      const group0 = new Twig();
      group0.userId = user.id;
      group0.abstractId = abstract.id;
      group0.detailId = groupIdToArrow[entry.groupId].id;
      group0.parent = parentTwig;
      group0.i = abstract.twigN + i;
      group0.x = x;
      group0.y = y;
      group0.z = abstract.twigZ + i;
      group0.windowId = entry.windowId;
      group0.groupId = entry.groupId;
      group0.degree = 2;
      group0.rank = entry.rank;
      group0.color = entry.color;
      group0.displayMode = DisplayMode.HORIZONTAL;
      return group0;
    });
    const groups1 = await this.twigsRepository.save(groups0);

    await this.arrowsService.incrementTwigN(abstract.id, groups.length);
    await this.arrowsService.incrementTwigZ(abstract.id, groups.length);

    return groups1;
  }

  async loadTabTwigs(user: User, tabs: TabEntry[], groupIdToTwig: any, tabIdToTwig: any) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);
    const arrows = await this.arrowsService.loadTabArrows(user, abstract, tabs);
    const urlToArrow = arrows.reduce((acc, arrow) => {
      acc[arrow.url] = arrow;
      return acc;
    }, {});

    const idToTabTwig = {};
    let degree = 3;
    let i = 1;
    while (tabs.length) {
      const nextTabs = [];
      const tabs0 = [];
      tabs.forEach(entry => {
        if (entry.degree === degree) {
          const parentTwig = entry.parentTabId
            ? tabIdToTwig[entry.parentTabId]
            : groupIdToTwig[entry.groupId];

          if (!parentTwig) {
            console.error(entry);
            throw new Error('Missing tab parentTwig')
          }

          const dx = parentTwig.x
          const dy = parentTwig.y
          const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
          const dx1 = Math.random() - 0.5;
          const dy1 = Math.random() - 0.5;
          const dr1 = Math.sqrt(Math.pow(dx1, 2) + Math.pow(dy1, 2));
          const x = Math.round((400 * (dx / dr)) + (400 * (dx1 / dr1)) + parentTwig.x);
          const y = Math.round((400 * (dy / dr)) + (400 * (dy1 / dr1)) + parentTwig.y);
      
          const tab0 = new Twig();
          tab0.userId = user.id;
          tab0.abstractId = abstract.id;
          tab0.detailId = urlToArrow[entry.url].id;
          tab0.parent = parentTwig;
          tab0.i = abstract.twigN + i;
          tab0.x = x;
          tab0.y = y;
          tab0.z = abstract.twigZ + i;
          tab0.color = entry.color;
          tab0.windowId = entry.windowId;
          tab0.groupId = entry.groupId;
          tab0.tabId = entry.tabId;
          tab0.degree = entry.degree;
          tab0.rank = entry.rank;
          tab0.index = entry.index;
          tab0.displayMode = DisplayMode.VERTICAL;
          tabs0.push(tab0);
          i++;
        }
        else {
          nextTabs.push(entry);
        }
      });

      const tabs1 = await this.twigsRepository.save(tabs0);
      tabs1.forEach(twig => {
        tabIdToTwig[twig.tabId] = twig;
        idToTabTwig[twig.id] = twig;
      });
      tabs = nextTabs;
      degree++;
    }
    const twigs = Object.keys(idToTabTwig || {}).map(id => idToTabTwig[id]);
    await this.arrowsService.incrementTwigN(abstract.id, twigs.length);
    await this.arrowsService.incrementTwigZ(abstract.id, twigs.length);

    return twigs;
  }

  async loadTabs(user: User, windows: WindowEntry[], groups: GroupEntry[], tabs: TabEntry[]) {
    try {
      const windowIds = windows.map(entry => entry.windowId);
      const windowTwigs = await this.twigsRepository.find({
        where: {
          userId: user.id, 
          windowId: In(windowIds),
          groupId: IsNull(),
          tabId: IsNull(),
        }
      });
      const windowIdToTwig = windowTwigs.reduce((acc, twig) => {
        acc[twig.windowId] = twig;
        return acc;
      }, {});
      
      const windows1 = windows.filter(entry => !windowIdToTwig[entry.windowId]);
  
      const windowTwigs1 = await this.loadWindowTwigs(user, windows1);
  
      const windowIdToTwig1 = windowTwigs1.reduce((acc, twig) => {
        acc[twig.windowId] = twig;
        return acc;
      }, windowIdToTwig);
  
      const groupIds = groups.map(entry => entry.groupId);
      const groupTwigs = await this.twigsRepository.find({
        where: {
          userId: user.id,
          groupId: In(groupIds),
          tabId: IsNull(),
        },
      });
      const groupIdToTwig = groupTwigs.reduce((acc, twig) => {
        acc[twig.groupId] = twig;
        return acc;
      }, {});
  
      const groups1 = groups.filter(entry => !groupIdToTwig[entry.groupId]);
  
      const groupTwigs1 = await this.loadGroupTwigs(
        user,  
        groups1, 
        windowIdToTwig1,
      );
  
      const groupIdToTwig1 = groupTwigs1.reduce((acc, twig) => {
        acc[twig.groupId] = twig;
        return acc;
      }, groupIdToTwig);
  
      const tabIds = tabs.map(entry => entry.tabId);
      const tabTwigs = await this.twigsRepository.find({
        where: {
          userId: user.id, 
          tabId: In(tabIds)
        }
      });
      const tabIdToTwig = tabTwigs.reduce((acc, twig) => {
        acc[twig.tabId] = twig;
        return acc;
      }, {});
  
      const tabs1 = tabs.filter(entry => !tabIdToTwig[entry.tabId]);
      
      const tabTwigs1 = await this.loadTabTwigs(
        user,
        tabs1,
        groupIdToTwig1,
        tabIdToTwig,
      );
  
      return [...windowTwigs1, ...groupTwigs1, ...tabTwigs1];
    } catch (err) {
      throw err;
    } finally {
     
    }

  }

  async createTab(user: User, tab: TabEntry) {
    try {
      const group = await this.twigsRepository.findOne({
        where: {
          userId: user.id,
          windowId: tab.windowId,
          groupId: tab.groupId,
          tabId: IsNull(),
        },
        relations: ['children']
      });

      let parent;

      let parentTab;
      if (tab.parentTabId) {
        parentTab = await this.twigsRepository.findOne({
          where: {
            userId: user.id,
            windowId: tab.windowId,
            groupId: tab.groupId,
            tabId: tab.parentTabId,
          },
          relations: ['children']
        });
        parent = parentTab;
      }
      else {
        parent = group
      }

      // increment sib rank
      let sibs = parent.children.filter(sib => sib.rank > tab.rank)
        .map(sib => {
          sib.rank += 1;
          return sib;
        });
      sibs = await this.twigsRepository.save(sibs);

      const [tabTwig] = await this.loadTabTwigs(user, [tab], {
        [group.groupId]: group,
      }, {
        ...(
          parentTab
            ? {[parentTab.tabId]: parentTab}
            : {}
        ),
      });

      return [tabTwig, ...sibs];
    } catch (err) {
      throw err;
    } finally {

    }

  }
  
  async createGroup(
    user: User, 
    group: GroupEntry, 
    window: WindowEntry | null, 
    tab: TabEntry | null, 
    tabTwigId: string | null,
  ) {
    try {
      const twigs = [];

      let windowTwig = await this.twigsRepository.findOne({
        where: {
          userId: user.id,
          windowId: group.windowId,
          groupId: IsNull(),
          tabId: IsNull(),
        }
      });

      if (window && !windowTwig) {
        // inc window sibling ranks
        let otherWindows = await this.twigsRepository.find({
          where: {
            userId: user.id,
            windowId: Not(IsNull()),
            groupId: IsNull(),
            tabId: IsNull(),
          }
        });
  
        otherWindows = otherWindows.map(w => {
          w.rank += 1;
          return w;
        });
  
        otherWindows = await this.twigsRepository.save(otherWindows);
        twigs.push(...otherWindows);
  
        // create window
        [windowTwig] = await this.loadWindowTwigs(user, [window]);
        twigs.push(windowTwig);
      }

      let groupTwig = await this.twigsRepository.findOne({
        where: {
          userId: user.id,
          windowId: group.windowId,
          groupId: group.groupId,
          tabId: IsNull(),
        }
      })
      if (!groupTwig) {
        // inc group sibling rank
        let otherGroups = await this.twigsRepository.find({
          where: {
            userId: user.id,
            windowId: group.windowId,
            tabId: IsNull(),
            rank: MoreThanOrEqual(group.rank),
          }
        });
    
        otherGroups = otherGroups.map(g => {
          g.rank += 1;
          return g;
        });
    
        otherGroups = await this.twigsRepository.save(otherGroups);
        twigs.push(...otherGroups);
    
        // create group
        [groupTwig] = await this.loadGroupTwigs(user, [group], {
          [windowTwig.windowId]: windowTwig,
        });
        twigs.push(groupTwig);
      }


      if (tab) {
        let tabTwig = await this.twigsRepository.findOne({
          where: {
            userId: user.id,
            windowId: tab.windowId,
            groupId: tab.groupId,
            tabId: tab.tabId,
          }
        });
  
        if (!tabTwig) {
          // group is newly created, so no siblings to move
          let parentTab; 
          if (tab.parentTabId) {
            parentTab = await this.twigsRepository.findOne({
              where: {
                userId: user.id,
                windowId: tab.windowId,
                groupId: tab.groupId,
                tabId: tab.parentTabId,
              }
            });
          }
    
          [tabTwig] = await this.loadTabTwigs(user, [tab], {
            [groupTwig.groupId]: groupTwig,
          }, {
            ...(parentTab 
                ? {[parentTab.tabId]: parentTab}
                : {}
            ),
          });
    
          twigs.push(tabTwig);
        }
      }
      else if (tabTwigId) {
        let tabTwig = await this.getTwigById(tabTwigId);
        if (!tabTwig) {
          throw new BadRequestException('This tab Twig does not exist');
        }
        const dDegree = 3 - tabTwig.degree;
        const dIndex = groupTwig.index + 1 - tabTwig.index;
  
        tabTwig.parent = groupTwig;
        tabTwig.groupId = groupTwig.groupId;
        tabTwig.degree = 3;
        tabTwig.rank = 1;
        tabTwig.index = groupTwig.index + 1;
        tabTwig.color = groupTwig.color;
        tabTwig = await this.twigsRepository.save(tabTwig);
        twigs.push(tabTwig);
  
        const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
          .findDescendants(tabTwig);
        
        let descs1 = [];
        descs.forEach(desc => {
          if (desc.id !== tabTwigId) {
            desc.groupId = groupTwig.groupId;
            desc.degree += dDegree;
            desc.index += dIndex;
            desc.color = groupTwig.color;
            descs1.push(desc);
          }
        });
  
        descs1 = await this.twigsRepository.save(descs1);
        twigs.push(...descs1);
      }
      else {
        throw new BadRequestException('Either tabEntry or tabTwigId must be provided')
      }
  
      return twigs;
    } catch (err) {
      throw err;
    } finally {

    }
  }

  async updateTab(user: User, twigId: string, title: string, url: string) {
    const twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }

    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const arrows = await this.arrowsService.loadTabArrows(user, abstract, [{
      url,
      title,
    }]);

    twig.detailId = arrows[0].id;
    return this.twigsRepository.save(twig);
  }

  async moveTab(user: User, twigId: string, windowId: number, groupId: number, parentTabId: number | null) {
    const twig = await this.twigsRepository.findOne({
      where: {
        id: twigId
      },
      relations: ['parent', 'parent.children']
    });
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }

    const groupTwig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        windowId,
        groupId,
        tabId: IsNull(),
      },
      relations: ['children']
    });
    if (!groupTwig) {
      throw new BadRequestException('This group twig does not exist');
    }

    let parentTwig;
    if (parentTabId) {
      parentTwig = await this.twigsRepository.findOne({
        where: {
          userId: user.id, 
          windowId,
          groupId,
          tabId: parentTabId
        },
        relations: ['children']
      });
      if (!parentTwig) {
        throw new BadRequestException('This parent tab twig does not exist');
      }
    }
    else {
      parentTwig = groupTwig;
    }

    // shift sibs
    let prevSibs = (twig.parent?.children || [])
      .filter(prevSib => prevSib.rank > twig.rank)
      .map(prevSib => {
        prevSib.rank -= 1;
        return prevSib;
      });

    const sibs = parentTwig.children.map(sib => {
      sib.rank += 1;
      return sib;
    });

    const dDegree = parentTwig.degree + 1 - twig.degree;
    const dIndex = parentTwig.index + 1 - twig.index;
    // move tab
    twig.parent = parentTwig;
    twig.groupId = groupId;
    twig.color = groupTwig.color;
    twig.degree = parentTwig.degree + 1;
    twig.rank = 1;
    twig.index = parentTwig.index + 1;
    twig.windowId = windowId;

    const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .findDescendants(twig);
    
    const descs1 = [];
    descs.forEach(desc => {
      if (desc.id !== twig.id) {
        desc.windowId = windowId;
        desc.groupId = groupId;
        desc.color = groupTwig.color;
        desc.degree += dDegree;
        desc.index += dIndex;
        descs1.push(desc);
      }
    })

    return this.twigsRepository.save([twig, ...prevSibs, ...sibs, ...descs1]);
  }

  async removeTabTwig(user: User, tabId: number) {
    const twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        tabId,
      },
      relations: ['parent', 'parent.children', 'children'],
    });

    if (!twig) {
      throw new BadRequestException('This tab twig does not exist')
    }

    twig.deleteDate = new Date();
    const twig1 = await this.twigsRepository.save(twig);

    const children0 = twig.children.map((child, i) => {
      child.parent = twig.parent;
      child.degree = child.degree - 1;
      child.rank = twig.rank + i;
      return child;
    });

    const children1 = await this.twigsRepository.save(children0);

    const sibs0 = (twig.parent?.children || []).filter(sib => sib.rank > twig.rank)
      .map(sib => {
        sib.rank = sib.rank - 1 + twig.children.length;
        return sib;
      });

    const sibs1 = await this.twigsRepository.save(sibs0);
    return {
      twig: twig1,
      children: children1,
      sibs: sibs1,
    }
  }

  async removeGroupTwig(user: User, groupId: number) {
    try {
      const twig = await this.twigsRepository.findOne({
        where: {
          userId: user.id,
          groupId,
          tabId: IsNull(),
        },
        relations: ['parent', 'parent.children']
      });
      if (!twig) {
        throw new BadRequestException('This group twig does not exist')
      }
      twig.deleteDate = new Date();
      const twig1 = await this.twigsRepository.save(twig);
  
      const sibs0 = (twig.parent?.children || []).filter(sib => sib.rank > twig.rank)
        .map(sib => {
          sib.rank -= 1;
          return sib;
        })
      const sibs1 = await this.twigsRepository.save(sibs0);
  
      return {
        twig: twig1,
        sibs: sibs1,
      };
    } catch (err) {
    } finally {
    }

  }

  async removeWindowTwig(user: User, windowId: number) {
    const twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        windowId,
        groupId: IsNull(),
        tabId: IsNull(),
      },
      relations: ['parent', 'parent.children'],
    });
    if (!twig) {
      throw new BadRequestException('This window twig does not exist')
    }
    twig.deleteDate = new Date();
    const twig1 = await  this.twigsRepository.save(twig);

    const sibs0 = (twig.parent?.children || []).filter(sib => sib.rank > twig.rank)
      .map(sib => {
        sib.rank -= 1;
        return sib;
      })
    const sibs1 = await this.twigsRepository.save(sibs0);

    return {
      twig: twig1,
      sibs: sibs1,
    };
  }
}
