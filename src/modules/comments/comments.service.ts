import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { findEntityOrFail } from 'src/common/utils/find-entity-or-fail.util';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationMetaDto } from 'src/common/dto/paginated-response.dto';
import { assertOwnerOrAdmin } from 'src/common/utils/assert-owner-or-admin.util';
import { AccessTokenPayload } from 'src/common/interfaces/token-payload.interface';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly i18n: I18nService,
  ) {}

  async create(
    dto: CreateCommentDto,
    articleId: number,
    authorId: number,
  ): Promise<CommentResponseDto> {
    await findEntityOrFail(
      this.articleRepository,
      { where: { id: articleId } },
      this.i18n.t('articles.error.notFound'),
    );

    const comment = this.commentRepository.create({
      ...dto,
      author: { id: authorId },
      article: { id: articleId },
    });

    const saved = await this.commentRepository.save(comment);
    const created = await findEntityOrFail(
      this.commentRepository,
      { where: { id: saved.id }, relations: { author: true } },
      this.i18n.t('comment.error.notFound'),
    );

    return new CommentResponseDto(created);
  }

  async findAll(
    articleId: number,
    query: PaginationQueryDto,
  ): Promise<{ data: CommentResponseDto[]; meta: PaginationMetaDto }> {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { article: { id: articleId } },
      relations: { author: true },
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: comments.map((comment) => new CommentResponseDto(comment)),
      meta: new PaginationMetaDto(query.page, query.limit, total),
    };
  }

  async update(
    id: number,
    currentUser: AccessTokenPayload,
    dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await findEntityOrFail(
      this.commentRepository,
      { where: { id }, relations: { author: true } },
      this.i18n.t('comment.error.notFound'),
    );

    assertOwnerOrAdmin(
      currentUser,
      comment.author.id === currentUser.sub,
      this.i18n.t('common.error.forbidden'),
    );

    if (dto.content?.trim()) {
      comment.content = dto.content;
    }

    const saved = await this.commentRepository.save(comment);

    return new CommentResponseDto(saved);
  }

  async remove(id: number, currentUser: AccessTokenPayload): Promise<void> {
    const comment = await findEntityOrFail(
      this.commentRepository,
      { where: { id }, relations: { author: true } },
      this.i18n.t('comment.error.notFound'),
    );

    assertOwnerOrAdmin(
      currentUser,
      comment.author.id === currentUser.sub,
      this.i18n.t('common.error.forbidden'),
    );

    await this.commentRepository.delete(id);
  }
}
