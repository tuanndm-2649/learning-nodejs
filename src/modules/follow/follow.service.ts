import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { findEntityOrFail } from 'src/common/utils/find-entity-or-fail.util';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowQueryDto } from './dto/follow-query.dto';
import { PaginationMetaDto } from 'src/common/dto/paginated-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}
  async create(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException(this.i18n.t('follow.error.selfFollow'));
    }

    await this.usersService.findOneOrFail(followingId);

    const follow = this.followRepository.create({
      follower: { id: followerId },
      following: { id: followingId },
    });

    await this.followRepository.save(follow);
  }

  async findAll(
    query: FollowQueryDto,
    userId: number,
  ): Promise<{ data: FollowResponseDto[]; meta: PaginationMetaDto }> {
    const { type } = query;
    const filterField = type === 'following' ? 'follower' : 'following';

    const [follows, total] = await this.followRepository.findAndCount({
      relations: { follower: true, following: true },
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
      where: { [filterField]: { id: userId } },
    });

    return {
      data: follows.map((follow) => new FollowResponseDto(follow, type)),
      meta: new PaginationMetaDto(query.page, query.limit, total),
    };
  }

  async remove(followerId: number, followingId: number) {
    const follow = await findEntityOrFail(
      this.followRepository,
      {
        where: { follower: { id: followerId }, following: { id: followingId } },
      },
      this.i18n.t('follow.error.errorUnfollow'),
    );

    await this.followRepository.delete(follow.id);
  }
}
