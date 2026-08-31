import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import { News } from './entities/news.entity';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';
import type { NewsItem } from '@5ss/contracts';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  /** Returns all published news items ordered by publishedAt DESC */
  async findAll(): Promise<NewsItem[]> {
    const rows = await this.newsRepository
      .createQueryBuilder('n')
      .where('n.publishedAt IS NOT NULL')
      .orderBy('n.publishedAt', 'DESC')
      .getMany();
    return rows.map(this.toDto);
  }

  /** Returns a single published news item by slug, or throws NEWS_NOT_FOUND */
  async findBySlug(slug: string): Promise<NewsItem> {
    const row = await this.newsRepository
      .createQueryBuilder('n')
      .where('n.slug = :slug', { slug })
      .andWhere('n.publishedAt IS NOT NULL')
      .getOne();
    if (!row) {
      throw new DomainException(
        DomainErrorCode.NEWS_NOT_FOUND,
        `News item '${slug}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toDto(row);
  }

  private toDto(row: News): NewsItem {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      tag: row.tag,
      imageUrl: row.imageUrl,
      publishedAt: row.publishedAt!.toISOString(),
    };
  }
}
