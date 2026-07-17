import { Article } from '../entities/article.entity';

class ArticleAuthorDto {
  id: number;
  name: string;
  email: string;

  constructor(author: Article['author']) {
    this.id = author.id;
    this.name = author.name;
    this.email = author.email;
  }
}

export class ArticleResponseDto {
  id: number;
  title: string;
  content: string;
  author: ArticleAuthorDto;
  createdAt: Date;
  updatedAt: Date;

  constructor(article: Article) {
    this.id = article.id;
    this.title = article.title;
    this.content = article.content;
    this.author = new ArticleAuthorDto(article.author);
    this.createdAt = article.createdAt;
    this.updatedAt = article.updatedAt;
  }
}
