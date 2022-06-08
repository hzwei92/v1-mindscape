import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from 'src/posts/posts.module';
import { Sub } from './sub.entity';
import { SubsResolver } from './subs.resolver';
import { SubsService } from './subs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sub]),
    forwardRef(() => PostsModule),
  ],
  providers: [SubsResolver, SubsService],
  exports: [SubsService],
})
export class SubsModule {}
