import { User } from '../../users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'follow' })
@Unique(['follower', 'following'])
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'follower_id' })
  follower!: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'following_id' })
  following!: User;
}
