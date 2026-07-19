import { Comment } from '../entities/comment.entity';

class CommentAuthorDto {
  id: number;
  name: string;

  constructor(author: Comment['author']) {
    this.id = author.id;
    this.name = author.name;
  }
}

export class CommentResponseDto {
  id: number;
  content: string;
  author: CommentAuthorDto;
  createdAt: Date;
  updatedAt: Date;

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.author = new CommentAuthorDto(comment.author);
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}
