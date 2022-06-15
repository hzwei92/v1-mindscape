import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { uuidRegexExp } from 'src/constants';
import { ArrowsService } from 'src/arrows/arrows.service';
import { RolesService } from 'src/roles/roles.service';
import { In, Repository } from 'typeorm';
import { Twig } from './twig.entity';
import { RoleType } from '../enums';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';
import { VotesService } from 'src/votes/votes.service';
import { checkPermit } from 'src/utils';
import { TwigEntry } from './twig.model';
import { v4 } from 'uuid';

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
    return child.parent;
  }

  async createRootTwigs(user: User, arrows: Arrow[]) {
    const twigs0 = arrows.map(arrow => {
      const twig0 = new Twig();
      twig0.userId = user.id;
      twig0.abstractId = arrow.id;
      twig0.detailId = arrow.id;
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

  async loadTwigs(user: User, entries: TwigEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist');
    }

    const arrows = await this.arrowsService.loadArrows(user, abstract, entries);
    const windowIdToArrow = {};
    const groupIdToArrow = {};
    const urlToArrow = {};

    console.log(5);
    arrows.forEach(arrow => {
      if (arrow.url) {
        urlToArrow[arrow.url] = arrow;
      }
      else {
        const label = arrow.title.split(':');
        console.log('label', label)
        if (label[0] === 'group') {
          groupIdToArrow[label[1]] = arrow;
        }
        else {
          windowIdToArrow[label[1]] = arrow;
        }
      }
    });
    console.log(4);

    const twigs = await this.getTwigsByIds(entries.map(entry => entry.parentId));
    const idToTwig = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});
    let tabEntries: TwigEntry[] = [];
    const groupEntries: TwigEntry[] = [];
    const windowEntries: TwigEntry[] = [];
    entries.forEach(entry => {
      if (entry.tabId) {
        tabEntries.push(entry);
      }
      else if (entry.groupId) {
        groupEntries.push(entry);
      }
      else {
        windowEntries.push(entry);
      }
    });

    const rootTwig = await this.getRootTwigByAbstractId(user.frameId);
    console.log(3, windowIdToArrow)
    let i = 1;
    const windows0 = [];
    windowEntries.forEach(entry => {
      const dx = Math.random() - 0.5;
      const dy = Math.random() - 0.5;
      const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const x = Math.round(800 * (dx / dr) + (800 * (Math.random() - 0.5)));
      const y = Math.round(800 * (dy / dr) + (800 * (Math.random() - 0.5)));
  
      const window0 = new Twig();
      window0.id = entry.id;
      window0.userId = user.id;
      window0.abstractId = user.frameId;
      window0.detailId = windowIdToArrow[entry.windowId].id;
      window0.parent = rootTwig;
      window0.i = abstract.twigN + i;
      window0.x = x;
      window0.y = y;
      window0.z = abstract.twigZ + i;
      window0.color = entry.color;
      window0.windowId = entry.windowId;
      windows0.push(window0);
      i++;
    });
    const windows1 = await this.twigsRepository.save(windows0);

    const windowIdToTwig = windows1.reduce((acc, twig) => {
      acc[twig.windowId] = twig;
      return acc;
    }, {});
    console.log(2)
    const groups0 = [];
    groupEntries.forEach(entry => {
      const parentTwig = windowIdToTwig[entry.windowId] || idToTwig[entry.parentId];
      if (!parentTwig) {
        throw new Error('Missing group parentTwig' + entry.id)
      }
      console.log(parentTwig, windowIdToTwig, entry.windowId);
      const dx = parentTwig.x
      const dy = parentTwig.y
      const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const x = Math.round(800 * (dx / dr) + (800 * (Math.random() - 0.5)) + parentTwig.x);
      const y = Math.round(800 * (dy / dr) + (800 * (Math.random() - 0.5)) + parentTwig.y);
  
      const group0 = new Twig();
      group0.id = entry.id;
      group0.userId = user.id;
      group0.abstractId = user.frameId;
      group0.detailId = groupIdToArrow[entry.groupId].id;
      group0.parent = parentTwig;
      group0.i = abstract.twigN + i;
      group0.x = x;
      group0.y = y;
      group0.z = abstract.twigZ + i;
      group0.windowId = entry.windowId;
      group0.groupId = entry.groupId;
      group0.color = entry.color;
      groups0.push(group0);
      i++;
    });

    const groups1 = await this.twigsRepository.save(groups0);

    const idToTwig1 = [...windows1, ...groups1].reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    console.log(1);
    let degree = 3;
    while (tabEntries.length) {
      const nextEntries = [];
      const tabs0 = [];
      tabEntries.forEach(entry => {
        if (entry.degree === degree) {
          const parentTwig = idToTwig1[entry.parentId] || idToTwig[entry.parentId];
          if (!parentTwig) {
            throw new Error('Missing tab parentTwig' + entry.id);
          }
          const dx = parentTwig.x
          const dy = parentTwig.y
          const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
          const x = Math.round(800 * (dx / dr) + (800 * (Math.random() - 0.5)) + parentTwig.x);
          const y = Math.round(800 * (dy / dr) + (800 * (Math.random() - 0.5)) + parentTwig.y);
      
          const tab0 = new Twig();
          tab0.id = entry.id;
          tab0.userId = user.id;
          tab0.abstractId = user.frameId;
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
          tabs0.push(tab0);
          i++;
        }
        else {
          nextEntries.push(entry);
        }
      })

      const tabs1 = await this.twigsRepository.save(tabs0);
      tabs1.forEach(twig => {
        idToTwig1[twig.id] = twig;
      })
      tabEntries = nextEntries;
      degree++;
    }

    console.log(0)
    return Object.keys(idToTwig1).map(id => idToTwig1[id]);
  }
}
