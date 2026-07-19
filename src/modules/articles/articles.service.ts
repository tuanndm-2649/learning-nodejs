import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { PaginationMetaDto } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { AccessTokenPayload } from 'src/common/interfaces/token-payload.interface';
import { assertOwnerOrAdmin } from 'src/common/utils/assert-owner-or-admin.util';
import { findEntityOrFail } from 'src/common/utils/find-entity-or-fail.util';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly i18n: I18nService,
  ) {}

  async create(
    dto: CreateArticleDto,
    authorId: number,
  ): Promise<ArticleResponseDto> {
    const article = this.articleRepository.create({
      ...dto,
      author: { id: authorId },
    });

    const saved = await this.articleRepository.save(article);
    const created = await findEntityOrFail(
      this.articleRepository,
      { where: { id: saved.id }, relations: { author: true } },
      this.i18n.t('articles.error.notFound'),
    );

    return new ArticleResponseDto(created);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<{ data: ArticleResponseDto[]; meta: PaginationMetaDto }> {
    const [articles, total] = await this.articleRepository.findAndCount({
      relations: { author: true },
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: articles.map((article) => new ArticleResponseDto(article)),
      meta: new PaginationMetaDto(query.page, query.limit, total),
    };
  }

  async findOneOrFail(id: number): Promise<ArticleResponseDto> {
    const article = await findEntityOrFail(
      this.articleRepository,
      { where: { id }, relations: { author: true } },
      this.i18n.t('articles.error.notFound'),
    );

    return new ArticleResponseDto(article);
  }

  async update(
    id: number,
    currentUser: AccessTokenPayload,
    dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = await findEntityOrFail(
      this.articleRepository,
      { where: { id }, relations: { author: true } },
      this.i18n.t('articles.error.notFound'),
    );

    assertOwnerOrAdmin(
      currentUser,
      article.author.id === currentUser.sub,
      this.i18n.t('common.error.forbidden'),
    );

    if (dto.title?.trim()) {
      article.title = dto.title;
    }

    if (dto.content) {
      article.content = dto.content;
    }

    const saved = await this.articleRepository.save(article);

    return new ArticleResponseDto(saved);
  }

  async remove(id: number, currentUser: AccessTokenPayload): Promise<void> {
    const article = await findEntityOrFail(
      this.articleRepository,
      { where: { id }, relations: { author: true } },
      this.i18n.t('articles.error.notFound'),
    );

    assertOwnerOrAdmin(
      currentUser,
      article.author.id === currentUser.sub,
      this.i18n.t('common.error.forbidden'),
    );

    await this.articleRepository.delete(id);
  }
}
