import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AccessTokenPayload } from 'src/common/interfaces/token-payload.interface';
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

  async create(dto: CreateArticleDto, authorId: number): Promise<Article> {
    const article = this.articleRepository.create({
      ...dto,
      author: { id: authorId },
    });

    const saved = await this.articleRepository.save(article);

    return this.findOneOrFail(saved.id);
  }

  findAll(): Promise<Article[]> {
    return this.articleRepository.find({ relations: { author: true } });
  }

  async findOneOrFail(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!article) {
      throw new NotFoundException(this.i18n.t('articles.error.notFound'));
    }

    return article;
  }

  async update(
    id: number,
    currentUser: AccessTokenPayload,
    dto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOneOrFail(id);

    this.assertCanModify(article, currentUser);

    if (dto.title) {
      article.title = dto.title;
    }

    if (dto.content) {
      article.content = dto.content;
    }

    return this.articleRepository.save(article);
  }

  async remove(id: number, currentUser: AccessTokenPayload): Promise<void> {
    const article = await this.findOneOrFail(id);

    this.assertCanModify(article, currentUser);

    await this.articleRepository.delete(id);
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
