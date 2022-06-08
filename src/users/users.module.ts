import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchModule } from 'src/search/search.module';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PostsModule } from 'src/posts/posts.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { RolesModule } from 'src/roles/roles.module';
import { LeadsModule } from 'src/leads/leads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PostsModule,
    RolesModule,
    LeadsModule,
    SearchModule,
    PubSubModule,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
