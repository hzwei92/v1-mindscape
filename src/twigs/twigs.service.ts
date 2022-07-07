import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { uuidRegexExp } from 'src/constants';
import { ArrowsService } from 'src/arrows/arrows.service';
import { RolesService } from 'src/roles/roles.service';
import { In, Repository } from 'typeorm';
import { Twig } from './twig.entity';
import { DisplayMode, RoleType } from '../enums';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';
import { checkPermit, IdToType } from 'src/utils';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { WindowEntry } from './dto/window-entry.dto';
import { GroupEntry } from './dto/group-entry.dto';
import { TabEntry } from './dto/tab-entry.dto';
import { BookmarkEntry } from './dto/bookmark-entry.dto';
import { v4 } from 'uuid';

@Injectable()
export class TwigsService {
  constructor (
    @InjectRepository(Twig) 
    private readonly twigsRepository: Repository<Twig>,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
    private readonly sheafsService: SheafsService,
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

  async getTwigsByAbstractIdAndDetailId(abstractId: string, detailId: string) {
    return this.twigsRepository.find({
      where: {
        abstractId,
        detailId,
      },
    });
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

  async createTwig(params: {
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
    degree: number,
    rank: number,
    isOpen: boolean,
  }) {
    const {
      user,
      abstract,
      detail,
      parentTwig, 
      twigId, 
      sourceId,
      targetId,
      i,
      x,
      y,
      z,
      degree,
      rank,
      isOpen,
    } = params;

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
    twig0.degree = degree;
    twig0.rank = rank;
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
      relations: ['abstract', 'children', 'detail']
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

    const postSheaf = await this.sheafsService.createSheaf(null, null, null);

    const { arrow: post } = await this.arrowsService.createArrow({
      user,
      id: postId,
      sourceId: null,
      targetId: null,
      abstract: parentTwig.abstract,
      sheaf: postSheaf,
      draft: null,
      title: null,
      url: null,
      faviconUrl: null,
    });

    const postTwig = await this.createTwig({
      user,
      abstract: parentTwig.abstract,
      detail: post,
      parentTwig,
      twigId,
      sourceId: null, 
      targetId: null,
      i: parentTwig.abstract.twigN + 1,
      x,
      y,
      z: parentTwig.abstract.twigZ + 1,
      degree: parentTwig.degree + 1,
      rank: parentTwig.children.length + 1,
      isOpen: true,
    });

    const linkSheaf = await this.sheafsService.createSheaf(parentTwig.detail.sheafId, post.sheafId, null);

    const { arrow: link } = await this.arrowsService.createArrow({
      user,
      id: null,
      sourceId: parentTwig.detailId,
      targetId: post.id,
      abstract: parentTwig.abstract,
      sheaf: linkSheaf,
      draft: null,
      title: null,
      url: null,
      faviconUrl: null,
    });

    const linkTwig = await this.createTwig({
      user,
      abstract: parentTwig.abstract,
      detail: link,
      parentTwig: null,
      twigId: null,
      sourceId: parentTwig.id,
      targetId: postTwig.id,
      i: parentTwig.abstract.twigN + 2,
      x: Math.round((parentTwig.x + x) / 2),
      y: Math.round((parentTwig.y + y) / 2),
      z: parentTwig.abstract.twigZ + 2,
      degree: 1,
      rank: 1,
      isOpen: false,
    });

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
    const sourceTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, source.id);
    if (!sourceTwigs.length) {
      throw new BadRequestException('This sourceTwig does not exist');
    }
    const targetTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, target.id);
    if (!targetTwigs.length) {
      throw new BadRequestException('This targetTwig does not exist');
    }

    let sheaf = await this.sheafsService.getSheafBySourceIdAndTargetId(source.sheafId, target.sheafId);
    if (sheaf) {
      sheaf = await this.sheafsService.incrementWeight(sheaf, 1, 0);
    }
    else {
      sheaf = await this.sheafsService.createSheaf(source.sheafId, target.sheafId, null);
    }
    const { arrow } = await this.arrowsService.createArrow({
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
    });

    const source1 = await this.arrowsService.getArrowById(source.id);
    const target1 = await this.arrowsService.getArrowById(target.id);

    let twigs = [];
    sourceTwigs.forEach(sourceTwig => {
      targetTwigs.forEach(targetTwig => {
        const x = Math.round((sourceTwig.x + targetTwig.x) / 2);
        const y = Math.round((sourceTwig.y + targetTwig.y) / 2);

        const twig = new Twig();
        twig.sourceId = sourceTwig.id;
        twig.targetId = targetTwig.id;
        twig.userId = user.id;
        twig.abstractId = abstract.id;
        twig.detailId = arrow.id;
        twig.i = abstract.twigN + twigs.length + 1;
        twig.x = x
        twig.y = y
        twig.z = abstract.twigZ + twigs.length + 1;
        twig.degree = 1;
        twig.rank = 1;
        twig.isOpen = false;
      
        twigs.push(twig);
      });
    });

    twigs = await this.twigsRepository.save(twigs);

    await this.arrowsService.incrementTwigN(abstract.id, twigs.length + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, twigs.length + 1);

    const abstract1 = await this.arrowsService.getArrowById(abstract.id);

    return {
      abstract: abstract1,
      twigs,
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
          desc.x = x;
          desc.y = y;
        }
        else {
          desc.x += dx;
          desc.y += dy;
        }
        return desc
      })
      twigs1 = await this.twigsRepository.save(descs);
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
    const rootTwig = await this.getTwigById(twigId);

    const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .createDescendantsQueryBuilder('twig', 'twigClosure', rootTwig)
      .getMany();
    
    const windowTwigs = await this.loadWindows(user, windowEntries);
    const groupTwigs = await this.loadGroups(user, groupEntries);
    const tabTwigs = await this.loadTabs(user, tabEntries);

    const idToTwig: IdToType<Twig> = [...windowTwigs, ...groupTwigs, ...tabTwigs].reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {})

    const date = new Date();
    let deleted: Twig[] = descs.reduce((acc, desc) => {
      if (desc.windowId && !idToTwig[desc.id]) {
        desc.deleteDate = date;
        acc.push(desc);
      }
      return acc;
    }, [])
    deleted = await this.twigsRepository.save(descs);

    return {
      windows: windowTwigs,
      groups: groupTwigs,
      tabs: tabTwigs,
      deleted,
    }
  }

  async loadWindows(user: User, windowEntries: WindowEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const parentTwigIdToTrue = windowEntries.reduce((acc, entry) => {
      acc[entry.parentTwigId] = true;
      return acc
    }, {});

    const twigs = await this.getTwigsByIds([
      ...Object.keys(parentTwigIdToTrue),
      ...windowEntries.map(entry => entry.twigId),
    ]);

    const idToTwig: IdToType<Twig> = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    await this.arrowsService.loadWindowArrows(user, abstract, windowEntries);

    let i = 0;
    let windowTwigs = windowEntries.map((entry, j) => {
      const parent = idToTwig[entry.parentTwigId];

      let twigI;
      if (idToTwig[entry.twigId]) {
        twigI = idToTwig[entry.twigId].i
      }
      else {
        twigI = abstract.twigN + i + 1;
        i++;
      }
      const twig = new Twig();
      twig.id = entry.twigId
      twig.userId = user.id;
      twig.abstractId = abstract.id;
      twig.detailId = entry.arrowId;
      twig.parent = parent;
      twig.i = twigI;
      twig.x = parent.x;
      twig.y = parent.y;
      twig.z = abstract.twigZ + j + 1;
      twig.windowId = entry.windowId;
      twig.degree = parent.degree + 1;
      twig.rank = entry.rank;
      twig.displayMode = DisplayMode.HORIZONTAL;
      return twig;
    });

    windowTwigs = await this.twigsRepository.save(windowTwigs);

    await this.arrowsService.incrementTwigN(abstract.id, i + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, windowTwigs.length);

    return windowTwigs;
  }
  
  async loadGroups(user: User, groupEntries: GroupEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const parentTwigIdToTrue = groupEntries.reduce((acc, entry) => {
      acc[entry.parentTwigId] = true;
      return acc
    }, {});

    const twigs = await this.getTwigsByIds([
      ...Object.keys(parentTwigIdToTrue),
      ...groupEntries.map(entry => entry.twigId),
    ]);

    const idToTwig: IdToType<Twig> = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    await this.arrowsService.loadGroupArrows(user, abstract, groupEntries);

    let i = 0;
    let groupTwigs = groupEntries.map((entry, i) => {
      const parent = idToTwig[entry.parentTwigId];

      let twigI;
      if (idToTwig[entry.twigId]) {
        twigI = idToTwig[entry.twigId].i;
      }
      else {
        twigI = abstract.twigN + i + 1;
        i++;
      }

      const twig = new Twig();
      twig.id = entry.twigId;
      twig.userId = user.id;
      twig.abstractId = abstract.id;
      twig.detailId = entry.arrowId;
      twig.parent = parent;
      twig.i = twigI;
      twig.x = parent.x;
      twig.y = parent.y;
      twig.z = abstract.twigZ + i + 1;
      twig.windowId = entry.windowId;
      twig.groupId = entry.groupId;
      twig.degree = parent.degree + 1;
      twig.rank = entry.rank;
      twig.color = entry.color;
      twig.displayMode = DisplayMode.HORIZONTAL;
      return twig;
    });

    groupTwigs = await this.twigsRepository.save(groupTwigs);

    await this.arrowsService.incrementTwigN(abstract.id, i + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, groupTwigs.length);

    return groupTwigs;
  }

  async loadTabs(user: User, tabEntries: TabEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const parentTwigIdToTrue = tabEntries.reduce((acc, entry) => {
      acc[entry.parentTwigId] = true;
      return acc
    }, {});

    const twigs = await this.getTwigsByIds([
      ...Object.keys(parentTwigIdToTrue),
      ...tabEntries.map(entry => entry.twigId)
    ]);

    const idToTwig: IdToType<Twig> = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    const tabTwigs = [];

    let tabEntries1 = await this.arrowsService.loadTabArrows(user, abstract, tabEntries) as TabEntry[];
    tabEntries1.sort((a, b) => a.degree < b.degree ? -1 : 1);

    let degree = tabEntries1[0]?.degree;
    let i = 0;
    let j = 0;
    while (tabEntries1.length) {
      const nextEntries = [];
      let twigs = [];
      tabEntries1.forEach(entry => {
        if (entry.degree === degree) {
          const parent = idToTwig[entry.parentTwigId];
          
          let twigI;
          if (idToTwig[entry.twigId]) {
            twigI = idToTwig[entry.twigId].i;
          }
          else {
            twigI = abstract.twigN + i + 1;
            i++;
          }
          const twig = new Twig();
          twig.id = entry.twigId;
          twig.userId = user.id;
          twig.abstractId = abstract.id;
          twig.detailId = entry.arrowId;
          twig.parent = parent;
          twig.i = twigI;
          twig.x = parent.x;
          twig.y = parent.y;
          twig.z = abstract.twigZ + j+ 1;
          twig.color = entry.color;
          twig.windowId = entry.windowId;
          twig.groupId = entry.groupId;
          twig.tabId = entry.tabId;
          twig.degree = parent.degree + 1;
          twig.rank = entry.rank;
          twig.displayMode = DisplayMode.VERTICAL;
          twigs.push(twig);
          j++;
        }
        else {
          nextEntries.push(entry);
        }
      });

      twigs = await this.twigsRepository.save(twigs);
      twigs.forEach(twig => {
        tabTwigs.push(twig);
        idToTwig[twig.id] = twig;
      });
      tabEntries1 = nextEntries;
      degree++;
    }

    await this.arrowsService.incrementTwigN(abstract.id, i + 1);
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
      relations: ['children', 'detail'],
    });

    let sibs = parent.children;
    sibs.filter(sib => sib.rank >= tabEntry.rank)
      .map(sib => {
        sib.rank += 1;
        return sib;
      });

    sibs = await this.twigsRepository.save(sibs);

    const tabIdToTwig = {};
    const groupTwigs = [];

    if (parent.tabId) {
      tabIdToTwig[parent.tabId] = parent;
    }
    else {
      groupTwigs.push(parent);
    }

    const [twig] = await this.loadTabs(user, [tabEntry]);

    const twigs = [twig];

    if (parent.tabId) {
      const abstract = await this.arrowsService.getArrowById(user.frameId);
      if (!abstract) {
        throw new BadRequestException('Missing abstract');
      }
      
      if (parent.detailId !== twig.detailId) {
        const { arrow } = await this.arrowsService.linkArrows(user, abstract, parent.detailId, twig.detailId);

        const sourceTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, parent.detailId);
        const targetTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, twig.detailId);

        let linkTwigs = [];
        sourceTwigs.forEach(sourceTwig => {
          targetTwigs.forEach(targetTwig => {
            const x = Math.round((sourceTwig.x + targetTwig.x) / 2);
            const y = Math.round((sourceTwig.y + targetTwig.y) / 2);
    
            const twig = new Twig();
            twig.sourceId = sourceTwig.id;
            twig.targetId = targetTwig.id;
            twig.userId = user.id;
            twig.abstractId = abstract.id;
            twig.detailId = arrow.id;
            twig.i = abstract.twigN + linkTwigs.length + 1;
            twig.x = x
            twig.y = y
            twig.z = abstract.twigZ + linkTwigs.length + 1;
            twig.degree = 1;
            twig.rank = 1;
            twig.isOpen = false;
          
            linkTwigs.push(twig);
          })
        })

        await this.arrowsService.incrementTwigN(abstract.id, linkTwigs.length + 1);
        await this.arrowsService.incrementTwigZ(abstract.id, linkTwigs.length + 1);

        linkTwigs = await this.twigsRepository.save(linkTwigs);

        twigs.push(...linkTwigs);
      }
    }

    return {
      twigs,
      sibs,
    };
  }

  async updateTab(user: User, twigId: string, title: string, url: string, faviconUrl: string | null) {
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
    const entries = await this.arrowsService.loadTabArrows(user, abstract, [{
      arrowId: v4(),
      url,
      title,
      faviconUrl,
    }]);

    if (twig.detailId === entries[0].arrowId) {
      return {
        twigs: [twig],
        deleted: [],
      };
    }
    else {
      const { arrow } = await this.arrowsService.linkArrows(user, abstract, twig.detailId, entries[0].arrowId);

      twig.detailId = entries[0].arrowId;

      await this.twigsRepository.update({id: twigId}, {
        detailId: entries[0].arrowId,
      });

      const sourceTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, arrow.sourceId);
      const targetTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, arrow.targetId);

      let twigs = [];
      sourceTwigs.forEach(sourceTwig => {
        targetTwigs.forEach(targetTwig => {
          const x = Math.round((sourceTwig.x + targetTwig.x) / 2);
          const y = Math.round((sourceTwig.y + targetTwig.y) / 2);
  
          const twig = new Twig();
          twig.sourceId = sourceTwig.id;
          twig.targetId = targetTwig.id;
          twig.userId = user.id;
          twig.abstractId = abstract.id;
          twig.detailId = arrow.id;
          twig.i = abstract.twigN + twigs.length + 1;
          twig.x = x
          twig.y = y
          twig.z = abstract.twigZ + twigs.length + 1;
          twig.degree = 1;
          twig.rank = 1;
          twig.isOpen = false;
        
          twigs.push(twig);
        });
      });

      twigs = await this.twigsRepository.save(twigs);

      const date = new Date();

      let deleted = [...twig.ins, ...twig.outs].map(linkTwig => {
        linkTwig.deleteDate = date;
        return linkTwig;
      });

      deleted = await this.twigsRepository.save(deleted);

      return {
        twigs: [twig, ...twigs],
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

  async removeTab(user: User, twigId: string) {
    let twig = await this.twigsRepository.findOne({
      where: {
        id: twigId,
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

    let links = [];
    await [...twig.ins, ...twig.outs].reduce(async (acc, sheaf) => {
      await acc;

      const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
        .findDescendants(sheaf);

      descs.forEach(desc => {
        desc.deleteDate = date;
        links.push(desc);
      })
    }, Promise.resolve());

    links = await this.twigsRepository.save(links);
    
    return {
      twig,
      children,
      descs,
      sibs,
      links,
    }
  }

  async removeGroup(user: User, twigId: string) {
    const twig = await this.twigsRepository.findOne({
      where: {
        id: twigId,
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

  async removeWindow(user: User, twigId: string) {
    const twig = await this.twigsRepository.findOne({
      where: {
        id: twigId,
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
    const rootTwig = await this.getTwigById(twigId);

    const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .createDescendantsQueryBuilder('twig', 'twigClosure', rootTwig)
      .getMany();
    
    const bookmarkTwigs = await this.loadBookmarks(user, bookmarkEntries);

    const idToTwig: IdToType<Twig> = bookmarkTwigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {})

    const date = new Date();
    let deleted: Twig[] = descs.reduce((acc, desc) => {
      if (desc.bookmarkId && !idToTwig[desc.id]) {
        desc.deleteDate = date;
        acc.push(desc);
      }
      return acc;
    }, [])
    deleted = await this.twigsRepository.save(descs);

    return {
      bookmarks: bookmarkTwigs,
      deleted,
    }
  }

  async loadBookmarks(user, entries: BookmarkEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const parentTwigIdToTrue = entries.reduce((acc, entry) => {
      acc[entry.parentTwigId] = true;
      return acc
    }, {});

    const twigs = await this.getTwigsByIds([
      ...Object.keys(parentTwigIdToTrue),
      ...entries.map(entry => entry.twigId)
    ]);

    const idToTwig: IdToType<Twig> = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    const bookmarkTwigs = [];

    let entries1 = await this.arrowsService.loadBookmarkArrows(user, abstract, entries);
    entries1.sort((a, b) => a.degree < b.degree ? -1 : 1);

    let degree = entries1[0]?.degree;
    let i = 0;
    let j = 0;
    while (entries1.length) {
      const nextEntries = [];
      let twigs = [];
      entries1.forEach(entry => {
        if (entry.degree === degree) {
          const parent = idToTwig[entry.parentTwigId];
          
          let twigI;
          if (idToTwig[entry.twigId]) {
            twigI = idToTwig[entry.twigId].i;
          }
          else {
            twigI = abstract.twigN + i + 1;
            i++;
          }
          const twig = new Twig();
          twig.id = entry.twigId;
          twig.userId = user.id;
          twig.abstractId = abstract.id;
          twig.detailId = entry.arrowId;
          twig.parent = parent;
          twig.i = twigI;
          twig.x = parent.x;
          twig.y = parent.y;
          twig.z = abstract.twigZ + j+ 1;
          twig.color = null;
          twig.windowId = null;
          twig.groupId = null;
          twig.tabId = null;
          twig.degree = parent.degree + 1;
          twig.rank = entry.rank;
          twig.displayMode = DisplayMode.VERTICAL;

          twigs.push(twig);
          j++;
        }
        else {
          nextEntries.push(entry);
        }
      });
  
      twigs = await this.twigsRepository.save(twigs);
      twigs.forEach(twig => {
        bookmarkTwigs.push(twig);
        idToTwig[twig.id] = twig;
      });
      entries1 = nextEntries;
      degree++;
    }

    await this.arrowsService.incrementTwigN(abstract.id, i + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, bookmarkTwigs.length);

    return bookmarkTwigs;
  }

  async createBookmark(user: User, entry: BookmarkEntry) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);
    if (!abstract) {
      throw new BadRequestException('Missing abstract');
    }
    const parentTwig = await this.twigsRepository.findOne({
      where: {
        id: entry.parentTwigId,
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

    let arrow = await this.arrowsService.getArrowByUserIdAndUrl(user.id, entry.url);
    if (!arrow) {
      ({ arrow }  = await this.arrowsService.createArrow({
        user, 
        id: entry.arrowId, 
        sourceId: null, 
        targetId: null, 
        abstract, 
        sheaf, 
        draft: null,
        title: entry.title, 
        url: entry.url,
        faviconUrl: null,
      }));
    }

    let twig = new Twig();
    twig.id = entry.twigId;
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

  async changeBookmark(user: User, bookmarkId: string, title: string, url: string | null) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);
    if (!abstract) {
      throw new BadRequestException('Missing abstract');
    }
    const twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId,
      },
      relations: ['detail'],
    });
    if (!twig) {
      throw new BadRequestException('Missing twig');
    }

    if (url && url !== twig.detail.url) {
      let arrow = await this.arrowsService.getArrowByUserIdAndUrl(user.id, url);
      if (!arrow) {
        let sheaf = await this.sheafsService.getSheafByUrl(url);
        if (!sheaf) {
          sheaf = await this.sheafsService.createSheaf(null, null, url);
        }
        ({ arrow } = await this.arrowsService.createArrow({
          user, 
          id: null, 
          sourceId: null,
          targetId: null, 
          abstract, 
          sheaf, 
          draft: null, 
          title, 
          url,
          faviconUrl: null,
        }));
      }
      twig.detailId = arrow.id;
    }
    else if (title !== twig.detail.title) {
      twig.detail.title = title;
      await this.arrowsService.saveArrows([twig.detail])
    }

    return this.twigsRepository.save(twig);
  }
  
  async moveBookmark(user: User, bookmarkId: string, parentBookmarkId: string, rank: number) {
    let twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId,
      },
      relations: ['parent', 'parent.children'],
    });

    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }

    const parentTwig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId: parentBookmarkId,
      },
      relations: ['children'],
    });

    if (!parentTwig) {
      throw new BadRequestException('This parent twig does not exist');
    }


    let prevSibs = [];
    let sibs = [];
    let dDegree = 0;
    if (parentTwig.id === twig.parent.id) {
      if (rank > twig.rank) {
        sibs = parentTwig.children.filter(sib => sib.rank > twig.rank && sib.rank <= rank)
          .map(sib => {
            sib.rank -= 1;
            return sib;
          });
        sibs = await this.twigsRepository.save(sibs);
      }
      else if (rank < twig.rank) {
        sibs = parentTwig.children.filter(sib => sib.rank < twig.rank && sib.rank >= rank)
          .map(sib => {
            sib.rank += 1;
            return sib;
          });
        sibs = await this.twigsRepository.save(sibs);
      }
      else {
        return {
          twig,
          prevSibs,
          sibs,
          descs: [],
        }
      }
    }
    else {
      prevSibs = (twig.parent.children || []).filter(prevSib => prevSib.rank > twig.rank)
        .map(prevSib => {
          prevSib.rank -= 1;
          return prevSib;
        })
      
      prevSibs = await this.twigsRepository.save(prevSibs);

      sibs = parentTwig.children.filter(sib => sib.rank >= rank)
        .map(sib => {
          sib.rank += 1;
          return sib;
        });

      sibs = await this.twigsRepository.save(sibs);

      dDegree = parentTwig.degree - twig.parent.degree;
    }

    twig.degree += dDegree;
    twig.rank = rank;
    twig.parent = parentTwig;

    twig = await this.twigsRepository.save(twig);

    let descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .findDescendants(twig);

    descs = descs.filter(desc => desc.id !== twig.id)
      .map(desc => {
        desc.degree += dDegree;
        return desc;
      });

    descs = await this.twigsRepository.save(descs);

    return {
      twig, 
      prevSibs,
      sibs,
      descs,
    }
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
