import { Like } from '../entities/like.entity';

class LikeUserDto {
  id: number;
  name: string;

  constructor(user: Like['user']) {
    this.id = user.id;
    this.name = user.name;
  }
}

export class LikeResponseDto {
  id: number;
  user: LikeUserDto;
  createdAt: Date;

  constructor(like: Like) {
    this.id = like.id;
    this.user = new LikeUserDto(like.user);
    this.createdAt = like.createdAt;
  }
}
