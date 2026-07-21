import { IsIn } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FollowQueryDto extends PaginationQueryDto {
  @IsIn(['follower', 'following'])
  type!: 'follower' | 'following';
}
