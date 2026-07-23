import { Article } from '../../articles/entities/article.entity';
import { User } from '../../users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'likes' })
@Unique(['user', 'article'])
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Article, { nullable: false })
  @JoinColumn({ name: 'article_id' })
  article!: Article;

  @CreateDateColumn()
  createdAt!: Date;
}
