import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { CommentsService } from './comments.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':articleId')
  @ApiOkResponse({ type: CommentResponseDto })
  create(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.create(dto, articleId, req.user!.sub);
  }

  @Get(':articleId')
  @ApiOkResponse({ type: PaginatedResponseDto(CommentResponseDto) })
  findAll(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.commentsService.findAll(articleId, query);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CommentResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(+id, req.user!, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.remove(+id, req.user!);
  }
}
