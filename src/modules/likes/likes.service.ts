import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { findEntityOrFail } from 'src/common/utils/find-entity-or-fail.util';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationMetaDto } from 'src/common/dto/paginated-response.dto';
import { LikeResponseDto } from './dto/like-response.dto';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly i18n: I18nService,
  ) {}

  async create(articleId: number, userId: number): Promise<void> {
    await findEntityOrFail(
      this.articleRepository,
      { where: { id: articleId } },
      this.i18n.t('articles.error.notFound'),
    );

    const like = this.likeRepository.create({
      user: { id: userId },
      article: { id: articleId },
    });

    await this.likeRepository.save(like);
  }

  async findAll(
    articleId: number,
    query: PaginationQueryDto,
  ): Promise<{ data: LikeResponseDto[]; meta: PaginationMetaDto }> {
    const [likes, total] = await this.likeRepository.findAndCount({
      where: { article: { id: articleId } },
      relations: { user: true },
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: likes.map((like) => new LikeResponseDto(like)),
      meta: new PaginationMetaDto(query.page, query.limit, total),
    };
  }

  async remove(articleId: number, userId: number): Promise<void> {
    const like = await findEntityOrFail(
      this.likeRepository,
      { where: { article: { id: articleId }, user: { id: userId } } },
      this.i18n.t('like.error.notLiked'),
    );

    await this.likeRepository.delete(like.id);
  }
}
