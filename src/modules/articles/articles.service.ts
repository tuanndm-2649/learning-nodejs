import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AccessTokenPayload } from 'src/common/interfaces/token-payload.interface';
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
    const created = await this.findEntityOrFail(saved.id);

    return new ArticleResponseDto(created);
  }

  async findAll(): Promise<ArticleResponseDto[]> {
    const articles = await this.articleRepository.find({
      relations: { author: true },
    });

    return articles.map((article) => new ArticleResponseDto(article));
  }

  async findOneOrFail(id: number): Promise<ArticleResponseDto> {
    const article = await this.findEntityOrFail(id);

    return new ArticleResponseDto(article);
  }

  async update(
    id: number,
    currentUser: AccessTokenPayload,
    dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.findEntityOrFail(id);

    this.assertCanModify(article, currentUser);

    if (dto.title) {
      article.title = dto.title;
    }

    if (dto.content) {
      article.content = dto.content;
    }

    const saved = await this.articleRepository.save(article);

    return new ArticleResponseDto(saved);
  }

  async remove(id: number, currentUser: AccessTokenPayload): Promise<void> {
    const article = await this.findEntityOrFail(id);

    this.assertCanModify(article, currentUser);

    await this.articleRepository.delete(id);
  }

  private async findEntityOrFail(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!article) {
      throw new NotFoundException(this.i18n.t('articles.error.notFound'));
    }

    return article;
  }

  private assertCanModify(
    article: Article,
    currentUser: AccessTokenPayload,
  ): void {
    const isAdmin = currentUser.role === 'admin';
    const isAuthor = article.author.id === currentUser.sub;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException(this.i18n.t('articles.error.forbidden'));
    }
  }
}
