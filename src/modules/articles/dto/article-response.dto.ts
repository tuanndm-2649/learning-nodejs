class ArticleAuthorDto {
  id!: number;
  name!: string;
  email!: string;
}

export class ArticleResponseDto {
  id!: number;
  title!: string;
  content!: string;
  author!: ArticleAuthorDto;
  createdAt!: Date;
  updatedAt!: Date;
}
