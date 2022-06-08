import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arrow } from './arrow.entity';
import { ArrowsService } from './arrows.service';
import { ArrowsResolver } from './arrows.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Arrow]),
  ],
  providers: [ArrowsService, ArrowsResolver]
})
export class ArrowsModule {}
