import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Article])],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [TypeOrmModule, LikesService],
})
export class LikesModule {}
