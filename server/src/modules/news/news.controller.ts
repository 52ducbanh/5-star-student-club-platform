import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewsService } from './news.service';

@ApiTags('news')
@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published news items ordered by publishedAt DESC' })
  async findAll() {
    return this.newsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single published news item by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }
}
