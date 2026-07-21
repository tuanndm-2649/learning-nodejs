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
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { LikeResponseDto } from './dto/like-response.dto';
import { LikesService } from './likes.service';

@ApiBearerAuth()
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  create(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.likesService.create(articleId, req.user!.sub);
  }

  @Get(':articleId')
  @ApiOkResponse({ type: PaginatedResponseDto(LikeResponseDto) })
  findAll(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.likesService.findAll(articleId, query);
  }

  @Delete(':articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.likesService.remove(articleId, req.user!.sub);
  }
}
