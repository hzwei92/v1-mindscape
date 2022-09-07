import { Module } from '@nestjs/common';
import { TabsService } from './tabs.service';
import { TabsResolver } from './tabs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tab } from './tab.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tab]),
  ],
  providers: [TabsService, TabsResolver]
})
export class TabsModule {}
