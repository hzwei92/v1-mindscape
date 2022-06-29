import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TWIG_HEIGHT, uuidRegexExp } from 'src/constants';
import { ArrowsService } from 'src/arrows/arrows.service';
import { RolesService } from 'src/roles/roles.service';
import { In, IsNull, Repository } from 'typeorm';
import { Twig } from './twig.entity';
import { DisplayMode, RoleType } from '../enums';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';
import { VotesService } from 'src/votes/votes.service';
import { checkPermit } from 'src/utils';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { Sheaf } from 'src/sheafs/sheaf.entity';
import { WindowEntry } from './dto/window-entry.dto';
import { GroupEntry } from './dto/group-entry.dto';
import { TabEntry } from './dto/tab-entry.dto';
import { BookmarkEntry } from './dto/bookmark-entry.dto';

@Injectable()
export class TwigsService {
  constructor (
    @InjectRepository(Twig) 
    private readonly twigsRepository: Repository<Twig>,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
    private readonly sheafsService: SheafsService,
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
    detail: Arrow | null,
    parentTwig: Twig | null, 
    twigId: string | null, 
    sourceId: string | null,
    targetId: string | null,
    i: number,
    x: number,
    y: number,
    z: number,
    isOpen: boolean,
  ) {
    const twig0 = new Twig();
    twig0.id = twigId || undefined;
    twig0.sourceId = sourceId;
    twig0.targetId = targetId;
    twig0.userId = user.id;
    twig0.abstractId = abstract.id;
    twig0.detailId = detail?.id;
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
      relations: ['abstract']
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
      null,
      draft,
      null,
      null,
    );
    const sheaf = await this.sheafsService.createSheaf(parentTwig.detailId, post.id, null);
    const { arrow } = await this.arrowsService.createArrow(
      user, 
      null, 
      parentTwig.detailId, 
      post.id, 
      parentTwig.abstract, 
      sheaf,
      null,
      null,
      null,
    )
    const postTwig = await this.createTwig(
      user,
      parentTwig.abstract,
      post,
      parentTwig,
      twigId,
      null, 
      null,
      parentTwig.abstract.twigN + 1,
      x,
      y,
      parentTwig.abstract.twigZ + 1,
      true,
    );
    const linkTwig = await this.createTwig(
      user,
      parentTwig.abstract,
      arrow,
      null,
      null,
      parentTwig.id,
      postTwig.id,
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

    let sheaf = await this.sheafsService.getSheafBySourceIdAndTargetId(sourceId, targetId);
    if (sheaf) {
      sheaf = await this.sheafsService.incrementWeight(sheaf, 1, 0);
    }
    else {
      sheaf = await this.sheafsService.createSheaf(sourceId, targetId, null);
    }
    const { arrow } = await this.arrowsService.createArrow(user, null, sourceId, targetId, abstract, sheaf, null, null, null);

    const source1 = await this.arrowsService.getArrowById(source.id);
    const target1 = await this.arrowsService.getArrowById(target.id);

    const x = Math.round((sourceTwig.x + targetTwig.x) / 2);
    const y = Math.round((sourceTwig.y + targetTwig.y) / 2);

    console.log('sheaf', sheaf);
    const twig = await this.createTwig(
      user, 
      abstract, 
      arrow,
      null, 
      null, 
      sourceTwig.id,
      targetTwig.id,
      abstract.twigN + 1, 
      x, 
      y, 
      abstract.twigZ + 1, 
      true
    );
  
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

  async moveTwig(user: User, twigId: string, x: number, y: number, displayMode: string) {
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

    let twigs1 = []
    if (displayMode === DisplayMode.SCATTERED) {
      const dx = x - twig.x;
      const dy = y - twig.y;

      let descs = await this.twigsRepository.manager.getTreeRepository(Twig).findDescendants(twig);

      descs = descs.map(desc => {
        if (desc.id === twigId) {
          desc.displayMode = DisplayMode[displayMode]
        }
        desc.x += dx;
        desc.y += dy;
        return desc
      })
      twigs1 = await this.twigsRepository.save(descs);
    }
    else {
      twig.x = x;
      twig.y = y;
      twig.displayMode = DisplayMode[displayMode];
      twigs1 = await this.twigsRepository.save([twig]);
    }

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

  async openTwig(user: User, twigId: string, shouldOpen: boolean) {
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
    twig0.isOpen = shouldOpen;
    const twig1 = await this.twigsRepository.save(twig0);

    return {
      twig: twig1,
      role: role1,
    }
  }

  async syncTabState(user: User, twigId: string, windowEntries: WindowEntry[], groupEntries: GroupEntry[], tabEntries: TabEntry[]) {
    const twig = await this.getTwigById(twigId);

    let descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .findDescendants(twig);

    const date = new Date();
    descs = descs
      .filter(desc => !!desc.windowId)
      .map(desc => {
        desc.deleteDate = date;
        return desc;
      });

    descs = await this.twigsRepository.save(descs);

    const windowTwigs = await this.loadWindows(user, windowEntries);

    const groupTwigs = await this.loadGroups(user, groupEntries);

    const tabTwigs = await this.loadTabs(user, tabEntries);

    return {
      windows: windowTwigs,
      groups: groupTwigs, 
      tabs: tabTwigs,
      deleted: descs,
    };
  }

  async loadWindows(user: User, windowEntries: WindowEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const parentTwigs = await this.getTwigsByIds(windowEntries.map(entry => entry.parentTwigId));

    const idToParentTwig = parentTwigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {})

    const arrows = await this.arrowsService.loadWindowArrows(user, abstract, windowEntries);
    const windowIdToArrow = arrows.reduce((acc, arrow) => {
      acc[arrow.title.split(' ')[1]] = arrow;
      return acc;
    }, {});

    let windowTwigs = windowEntries.map((entry, i) => {
      const parentTwig = idToParentTwig[entry.parentTwigId]
      const twig = new Twig();
      twig.id = entry.twigId;
      twig.userId = user.id;
      twig.abstractId = abstract.id;
      twig.detailId = windowIdToArrow[entry.windowId].id;
      twig.parent = parentTwig;
      twig.i = abstract.twigN + i + 1;
      twig.x = parentTwig.x;
      twig.y = parentTwig.y;
      twig.z = abstract.twigZ + i + 1;
      twig.windowId = entry.windowId;
      twig.degree = parentTwig.degree + 1;
      twig.rank = entry.rank;
      twig.displayMode = DisplayMode.VERTICAL;
      return twig;
    });

    windowTwigs = await this.twigsRepository.save(windowTwigs);

    await this.arrowsService.incrementTwigN(abstract.id, windowTwigs.length);
    await this.arrowsService.incrementTwigZ(abstract.id, windowTwigs.length);

    return windowTwigs;
  }
  
  async loadGroups(user: User, groupEntries: GroupEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const parentTwigs = await this.getTwigsByIds(groupEntries.map(entry => entry.parentTwigId));

    const idToParentTwig = parentTwigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {})

    const arrows = await this.arrowsService.loadGroupArrows(user, abstract, groupEntries);
    const groupIdToArrow = arrows.reduce((acc, arrow) => {
      acc[arrow.title.split(' ')[1]] = arrow;
      return acc;
    }, {});

    let groupTwigs = groupEntries.map((entry, i) => {
      const parentTwig = idToParentTwig[entry.parentTwigId];

      const twig = new Twig();
      twig.id = entry.twigId;
      twig.userId = user.id;
      twig.abstractId = abstract.id;
      twig.detailId = groupIdToArrow[entry.groupId].id;
      twig.parent = parentTwig;
      twig.i = abstract.twigN + i + 1;
      twig.x = parentTwig.x;
      twig.y = parentTwig.y;
      twig.z = abstract.twigZ + i + 1;
      twig.windowId = entry.windowId;
      twig.groupId = entry.groupId;
      twig.degree = parentTwig.degree + 1;
      twig.rank = entry.rank;
      twig.color = entry.color;
      twig.displayMode = DisplayMode.HORIZONTAL;
      return twig;
    });

    groupTwigs = await this.twigsRepository.save(groupTwigs);

    await this.arrowsService.incrementTwigN(abstract.id, groupTwigs.length);
    await this.arrowsService.incrementTwigZ(abstract.id, groupTwigs.length);

    return groupTwigs;
  }

  async loadTabs(user: User, tabEntries: TabEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const parentTwigs = await this.getTwigsByIds(tabEntries.map(entry => entry.parentTwigId));

    const idToParentTwig = parentTwigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {})

    const arrows = await this.arrowsService.loadTabArrows(user, abstract, tabEntries);

    const urlToArrow = arrows.reduce((acc, arrow) => {
      acc[arrow.url] = arrow;
      return acc;
    }, {});


    const tabTwigs = [];
    tabEntries.sort((a, b) => a.degree < b.degree ? -1 : 1);

    let degree = tabEntries[0].degree;
    let i = 0;
    while (tabEntries.length) {
      const nextEntries = [];
      let twigs = [];
      tabEntries.forEach(entry => {
        if (entry.degree === degree) {
          const parentTwig = idToParentTwig[entry.parentTwigId];
          
          if (!parentTwig) {
            throw Error('Missing parent twig for entry with parentTwigId ' + entry.parentTwigId)
          }

          const twig = new Twig();
          twig.id = entry.twigId;
          twig.userId = user.id;
          twig.abstractId = abstract.id;
          twig.detailId = urlToArrow[entry.url].id;
          twig.parent = parentTwig;
          twig.i = abstract.twigN + i + 1;
          twig.x = parentTwig.x;
          twig.y = parentTwig.y;
          twig.z = abstract.twigZ + i + 1;
          twig.color = entry.color;
          twig.windowId = entry.windowId;
          twig.groupId = entry.groupId;
          twig.tabId = entry.tabId;
          twig.degree = entry.degree;
          twig.rank = entry.rank;
          twig.displayMode = DisplayMode.VERTICAL;
          twigs.push(twig);
          i++;
        }
        else {
          nextEntries.push(entry);
        }
      });

      twigs = await this.twigsRepository.save(twigs);
      twigs.forEach(twig => {
        tabTwigs.push(twig);
        idToParentTwig[twig.id] = twig;
      });
      tabEntries = nextEntries;
      degree++;
    }

    await this.arrowsService.incrementTwigN(abstract.id, tabTwigs.length);
    await this.arrowsService.incrementTwigZ(abstract.id, tabTwigs.length);

    return tabTwigs;
  }

  async createWindow(user, windowEntry: WindowEntry) {
    const parent = await this.twigsRepository.findOne({
      where: {
        id: windowEntry.parentTwigId,
      },
      relations: ['children'],
    });

    let sibs = parent.children;
    sibs.filter(sib => sib.rank >= windowEntry.rank)
      .map(sib => {
        sib.rank += 1;
        return sib;
      });

    sibs = await this.twigsRepository.save(sibs);

    const [twig] = await this.loadWindows(user, [windowEntry]);

    return {
      twig,
      sibs,
    };
  }

  async createGroup(user, groupEntry: GroupEntry) {
    const parent = await this.twigsRepository.findOne({
      where: {
        id: groupEntry.parentTwigId,
      },
      relations: ['children'],
    });

    let sibs = parent.children;
    sibs.filter(sib => sib.rank >= groupEntry.rank)
      .map(sib => {
        sib.rank += 1;
        return sib;
      });

    sibs = await this.twigsRepository.save(sibs);

    const [twig] = await this.loadGroups(user, [groupEntry]);

    return {
      twig,
      sibs,
    };
  }

  async createTab(user, tabEntry: TabEntry) {
    const parent = await this.twigsRepository.findOne({
      where: {
        id: tabEntry.parentTwigId,
      },
      relations: ['children'],
    });

    let sibs = parent.children;
    sibs.filter(sib => sib.rank >= tabEntry.rank)
      .map(sib => {
        sib.rank += 1;
        return sib;
      });

    sibs = await this.twigsRepository.save(sibs);

    const [twig] = await this.loadTabs(user, [tabEntry]);

    return {
      twig,
      sibs,
    };
  }

  async updateTab(user: User, twigId: string, title: string, url: string) {
    let twig = await this.twigsRepository.findOne({
      where: {
        id: twigId,
      },
      relations: ['ins', 'outs']
    })
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(user.frameId);
    const arrows = await this.arrowsService.loadTabArrows(user, abstract, [{
      url,
      title,
    }]);

    if (twig.detailId === arrows[0].id) {
      return {
        twig,
        deleted: [],
      };
    }
    else {
      twig.detailId = arrows[0].id;

      await this.twigsRepository.update({id: twigId}, {
        detailId: arrows[0].id,
      });

      const date = new Date();

      let deleted = [...twig.ins, ...twig.outs];

      deleted = deleted.map(linkTwig => {
        linkTwig.deleteDate = date;
        return linkTwig;
      });

      deleted = await this.twigsRepository.save(deleted);

      await this.arrowsService.linkArrows(user, abstract, twig.detailId, arrows[0].id);

      return {
        twig,
        deleted,
      }
    }
  }

  async moveTab(user: User, twigId: string, groupTwigId: string, parentTwigId: string | null) {
    let tabTwig = await this.twigsRepository.findOne({
      where: {
        id: twigId
      },
      relations: ['parent', 'parent.children']
    });
    if (!tabTwig) {
      throw new BadRequestException('This tab twig does not exist');
    }

    const groupTwig = await this.twigsRepository.findOne({
      where: {
        id: groupTwigId,
      },
      relations: ['children'],
    });

    if (!groupTwig) {
      throw new BadRequestException('This group twig does not exist');
    }

    let parentTwig;
    if (parentTwigId) {
      parentTwig = await this.twigsRepository.findOne({
        where: {
          id: parentTwigId,
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

    let prevSibs = (tabTwig.parent?.children || [])
      .filter(prevSib => prevSib.rank > tabTwig.rank)
      .map(prevSib => {
        prevSib.rank -= 1;
        return prevSib;
      });
    prevSibs = await this.twigsRepository.save(prevSibs);

    let sibs = (parentTwig.children || [])
      .filter(sib => sib.id !== tabTwig.id)
      .map(sib => {
        sib.rank += 1;
        return sib;
      });
    sibs = await this.twigsRepository.save(sibs);

    const dDegree = parentTwig.degree + 1 - tabTwig.degree;
    // move tab
    tabTwig.parent = parentTwig;
    tabTwig.windowId = groupTwig.windowId;
    tabTwig.groupId = groupTwig.groupId;
    tabTwig.color = groupTwig.color;
    tabTwig.degree = parentTwig.degree + 1;
    tabTwig.rank = 1;
    tabTwig = await this.twigsRepository.save(tabTwig);

    let descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .findDescendants(tabTwig);
    
    const descs1 = [];
    descs.forEach(desc => {
      if (desc.id !== tabTwig.id) {
        desc.windowId = groupTwig.windowId;
        desc.groupId = groupTwig.groupId;
        desc.color = groupTwig.color;
        desc.degree += dDegree;
        descs1.push(desc);
      }
    })
    descs = await this.twigsRepository.save(descs1);

    return {
      twig: tabTwig,
      prevSibs,
      sibs,
      descs,
    }
  }

  async removeTab(user: User, tabId: number) {
    let twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        tabId,
      },
      relations: ['parent', 'parent.children', 'children', 'ins', 'outs'],
    });

    if (!twig) {
      throw new BadRequestException('This tab twig does not exist')
    }

    const date = new Date();
    twig.deleteDate = date;
    twig = await this.twigsRepository.save(twig);

    let children = twig.children
      .sort((a,b) => a.rank < b.rank ? -1 : 1)
      .map((child, i) => {
        child.parent = twig.parent;
        child.degree = child.degree - 1;
        child.rank = twig.rank + i;
        return child;
      });

    children = await this.twigsRepository.save(children);

    let descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .findDescendants(twig);
    
    const descs1 = [];
    descs.forEach(desc => {
      if (!children.some(child => child.id === desc.id)) {
        desc.degree -= 1;
        descs1.push(desc);
      }
    })

    descs = await this.twigsRepository.save(descs1);

    let sibs = (twig.parent?.children || []).filter(sib => sib.rank > twig.rank)
      .map(sib => {
        sib.rank += twig.children.length - 1;
        return sib;
      });

    sibs = await this.twigsRepository.save(sibs);

    let sheafs = [];
    await [...twig.ins, ...twig.outs].reduce(async (acc, sheaf) => {
      await acc;

      const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
        .findDescendants(sheaf);

      descs.forEach(desc => {
        desc.deleteDate = date;
        sheafs.push(desc);
      })
    }, Promise.resolve());

    sheafs = await this.twigsRepository.save(sheafs);
    
    return {
      twig,
      children,
      descs,
      sibs,
      sheafs,
    }
  }

  async removeGroup(user: User, groupId: number) {
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
  }

  async removeWindow(user: User, windowId: number) {
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

  async syncBookmarks(user: User, twigId: string, bookmarkEntries: BookmarkEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const rootTwig = await this.getTwigById(twigId);
    const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .createDescendantsQueryBuilder('twig', 'twigClosure', rootTwig)
      .leftJoinAndSelect('twig.detail', 'detail')
      .getMany();
    
    const bookmarkIdToTwig = {};
    const deleteBookmarkIdToTwig = {}
    descs.forEach(desc => {
      if (desc.bookmarkId) {
        bookmarkIdToTwig[desc.bookmarkId] = desc;
        deleteBookmarkIdToTwig[desc.bookmarkId] = desc;
      }
    });

    const readyBookmarkIdToEntry = {};
    const updateBookmarkIdToEntry = {};
    const createBookmarkEntries = [];
    bookmarkEntries.forEach(entry => {
      const twig = bookmarkIdToTwig[entry.bookmarkId]
      if (twig) {
        delete deleteBookmarkIdToTwig[entry.bookmarkId];

        if (twig.detail.title === entry.title && twig.detail.url === entry.url) {
          readyBookmarkIdToEntry[entry.bookmarkId] = entry;
        }
        else {
          updateBookmarkIdToEntry[entry.bookmarkId] = entry;
        }
      }
      else {
        createBookmarkEntries.push(entry);
      }
    })

    const arrows = await this.arrowsService.loadTabArrows(user, abstract, [
      ...Object.keys(updateBookmarkIdToEntry || {}).map(id => updateBookmarkIdToEntry[id]), 
      ...createBookmarkEntries,
    ]);
    
    const urlToArrow = {}
    const titleToArrows = {};
    arrows.forEach(arrow => {
      if (arrow.url) {
        urlToArrow[arrow.url] = arrow;
      }
      else {
        if (titleToArrows[arrow.title]) {
          titleToArrows[arrow.title].push(arrow);
        }
        else {
          titleToArrows[arrow.title] = [arrow];
        }
      }
    });
    
    let twigs = [];
    
    console.log(bookmarkIdToTwig);
    const entryLists = [
      ...Object.keys(readyBookmarkIdToEntry || {}).map(id => readyBookmarkIdToEntry[id]),
      ...Object.keys(updateBookmarkIdToEntry || {}).map(id => updateBookmarkIdToEntry[id]),
      ...createBookmarkEntries
    ].reduce((acc, entry) => {
      if (acc[entry.degree - 1]) {
        acc[entry.degree - 1].push(entry);
      }
      else {
        acc[entry.degree - 1] = [entry];
      }
      return acc;
    }, [])

    const bookmarks = [];
    let i = 1;
    await entryLists.reduce(async (acc, entries) => {
      await acc;

      let twigs = [];
      entries.forEach(entry => {
        const parentTwig = entry.degree === 1
          ? rootTwig
          : bookmarkIdToTwig[entry.parentBookmarkId];

        let twig;
        let detail;

        if (readyBookmarkIdToEntry[entry.bookmarkId]) {
          twig = bookmarkIdToTwig[entry.bookmarkId];
          detail = twig.detail;
        }
        else if (updateBookmarkIdToEntry[entry.bookmarkId]) {
          twig = bookmarkIdToTwig[entry.bookmarkId];
          if (entry.url) {
            detail = urlToArrow[entry.url];
          }
          else {
            detail = titleToArrows[entry.title].shift();
          }  
        }
        else {
          twig = new Twig();
          if (entry.url) {
            detail = urlToArrow[entry.url];
          }
          else {
            detail = titleToArrows[entry.title].shift();
          }  
        }

        twig.userId = user.id;
        twig.abstractId = abstract.id;
        twig.detailId = detail.id;
        twig.parent = parentTwig;
        twig.bookmarkId = entry.bookmarkId;
        twig.degree = rootTwig.degree + entry.degree;
        twig.rank = entry.rank;
        twig.i = abstract.twigN + i + 1;
        twig.x = parentTwig.x;
        twig.y = parentTwig.y;
        twig.z = abstract.twigZ + i + 1;
        twig.displayMode = entry.degree === 1
          ? DisplayMode.HORIZONTAL
          : DisplayMode.VERTICAL

        twigs.push(twig);
        bookmarkIdToTwig[twig.bookmarkId] = twig;
        i++;
      });

      twigs = await this.twigsRepository.save(twigs);

      bookmarks.push(...twigs);
    }, Promise.resolve());

    const date = new Date();
    let deleted = Object.keys(deleteBookmarkIdToTwig || {}).map(id => {
      const twig = deleteBookmarkIdToTwig[id];
      twig.deleteDate = date;
      return twig;
    });

    deleted = await this.twigsRepository.save(deleted);

    return {
      bookmarks,
      deleted,
    }
  }

  async createBookmark(user: User, entry: BookmarkEntry) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);
    if (!abstract) {
      throw new BadRequestException('Missing abstract');
    }
    const parentTwig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId: entry.parentBookmarkId,
      },
      relations: ['children'],
    });
    if (!parentTwig) {
      throw new BadRequestException('Missing parent twig');
    }
    let sheaf;
    if (entry.url) {
      sheaf = await this.sheafsService.getSheafByUrl(entry.url);
    } 
    if (!sheaf) {
      sheaf = await this.sheafsService.createSheaf(null, null, entry.url)
    }

    const { arrow }  = await this.arrowsService.createArrow(user, null, null, null, abstract, sheaf, null, entry.title, entry.url)

    let twig = new Twig();
    twig.userId = user.id;
    twig.abstractId = abstract.id;
    twig.detailId = arrow.id;
    twig.parent = parentTwig;
    twig.bookmarkId = entry.bookmarkId;
    twig.degree = parentTwig.degree + entry.degree;
    twig.rank = entry.rank;
    twig.i = abstract.twigN + 1;
    twig.x = parentTwig.x;
    twig.y = parentTwig.y;
    twig.z = abstract.twigZ + 1;
    twig.displayMode = DisplayMode.VERTICAL

    twig = await this.twigsRepository.save(twig);

    await this.arrowsService.incrementTwigN(abstract.id, 1);
    await this.arrowsService.incrementTwigZ(abstract.id, 1);

    let sibs = (parentTwig.children || []).filter(sib => sib.rank > twig.rank)
      .map(sib => {
        sib.rank += 1;
        return sib;
      });
    sibs = await this.twigsRepository.save(sibs);

    return {
      twig,
      sibs,
    };
  }

  async removeBookmark(user: User, bookmarkId: string) {
    const twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId,
      },
      relations: ['parent', 'parent.children'],
    });

    let twigs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .findDescendants(twig);

    const date = new Date();
    twigs = twigs.map(twig => {
      twig.deleteDate = date;
      return twig;
    });

    twigs = await this.twigsRepository.save(twigs);

    let sibs = twig.parent.children.filter(sib => sib.rank > twig.rank)
      .map(sib => {
        sib.rank -= 1;
        return sib;
      });

    sibs = await this.twigsRepository.save(sibs);
    
    return {
      twigs,
      sibs,
    }
  }
}
