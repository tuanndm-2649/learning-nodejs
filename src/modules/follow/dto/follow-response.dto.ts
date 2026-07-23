import { Follow } from '../entities/follow.entity';

class FollowUserDto {
  id: number;
  name: string;

  constructor(user: Follow['follower']) {
    this.id = user.id;
    this.name = user.name;
  }
}

export class FollowResponseDto {
  id: number;
  user: FollowUserDto;
  createdAt: Date;

  constructor(follow: Follow, side: 'follower' | 'following') {
    this.id = follow.id;
    this.user = new FollowUserDto(follow[side]);
    this.createdAt = follow.createdAt;
  }
}
