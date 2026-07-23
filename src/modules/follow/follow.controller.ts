import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { FollowQueryDto } from './dto/follow-query.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowService } from './follow.service';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

@ApiBearerAuth()
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':followingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  create(
    @Param('followingId', ParseIntPipe) followingId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.followService.create(req.user!.sub, followingId);
  }

  @Get(':userId')
  @ApiOkResponse({ type: PaginatedResponseDto(FollowResponseDto) })
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FollowQueryDto,
  ) {
    return this.followService.findAll(query, userId);
  }

  @Delete(':followingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('followingId', ParseIntPipe) followingId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.followService.remove(req.user!.sub, followingId);
  }
}
