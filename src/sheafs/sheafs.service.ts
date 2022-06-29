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

  async getSheafByUrl(url: string) {
    return this.sheafsRepository.findOne({
      where: {
        url,
      }
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

  async createSheaf(sourceId: string | null, targetId: string | null, url: string | null) {
    await this.arrowsService.incrementOutCount(sourceId, 1);
    await this.arrowsService.incrementInCount(targetId, 1);

    const sheaf = new Sheaf();
    sheaf.id = v4();
    sheaf.sourceId = sourceId || sheaf.id;
    sheaf.targetId = targetId || sheaf.id;
    sheaf.routeName = sheaf.id;
    sheaf.url = url
    return this.sheafsRepository.save(sheaf);
  }

  async saveSheafs(sheafs: Sheaf[]) {
    return this.sheafsRepository.save(sheafs);
  }

  async incrementWeight(sheaf: Sheaf, clicks: number, tokens: number) {
    sheaf.clicks = sheaf.clicks + clicks;
    sheaf.tokens = sheaf.tokens + tokens;
    sheaf.weight = findDefaultWeight(sheaf.clicks, sheaf.tokens);

    return this.sheafsRepository.save(sheaf);
  }
}