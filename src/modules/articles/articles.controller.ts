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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { ArticlesService } from './articles.service';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiBearerAuth()
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiCreatedResponse({ type: ArticleResponseDto })
  create(
    @Body() dto: CreateArticleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.create(dto, req.user!.sub);
  }

  @Get()
  @ApiOkResponse({ type: PaginatedResponseDto(ArticleResponseDto) })
  findAll(@Query() query: PaginationQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ArticleResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ArticleResponseDto> {
    return this.articlesService.findOneOrFail(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ArticleResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.update(id, req.user!, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.remove(id, req.user!);
  }
}
