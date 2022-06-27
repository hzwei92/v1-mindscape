import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrowsService } from 'src/arrows/arrows.service';
import { findDefaultWeight } from 'src/utils';
import { Repository } from 'typeorm';
import { Sheaf } from './sheaf.entity';
import { v4 } from 'uuid';

@Injectable()
export class SheafsService {
  constructor(
    @InjectRepository(Sheaf)
    private readonly sheafsRepository: Repository<Sheaf>,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
  ) {}

  async getSheafById(id: string) {
    return this.sheafsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getSheafBySourceIdAndTargetId(sourceId: string, targetId: string) {
    return this.sheafsRepository.findOne({
      where: {
        sourceId,
        targetId,
      }
    });
  }

  async createSheaf(sourceId: string, targetId: string) {
    await this.arrowsService.incrementOutCount(sourceId, 1);
    await this.arrowsService.incrementInCount(targetId, 1);

    const sheaf = new Sheaf();
    sheaf.id = v4();
    sheaf.sourceId = sourceId;
    sheaf.targetId = targetId;
    sheaf.routeName = sheaf.id;
    return this.sheafsRepository.save(sheaf);
  }

  async incrementWeight(sheaf: Sheaf, clicks: number, tokens: number) {
    const sheaf0 = new Sheaf();
    sheaf0.id = sheaf.id;
    sheaf0.clicks = sheaf.clicks + clicks;
    sheaf0.tokens = sheaf.tokens + tokens;
    sheaf0.weight = findDefaultWeight(sheaf0.clicks, sheaf0.tokens);

    return this.sheafsRepository.save(sheaf0);
  }
}
