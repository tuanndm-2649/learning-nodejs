import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow]), UsersModule],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [TypeOrmModule, FollowService],
})
export class FollowModule {}
