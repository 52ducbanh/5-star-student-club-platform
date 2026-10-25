import { Controller, Get, Header, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { Pool } from 'pg';

@Controller('api/health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  live() { return { status: 'ok', service: '5ss-api' }; }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async ready() {
    try {
      // Reuse the existing pg pool; query_timeout cancels the client-side wait.
      const pool = (this.dataSource.driver as unknown as { master: Pool }).master;
      await pool.query({ text: 'SELECT 1', query_timeout: 2000 });
      return { status: 'ok', service: '5ss-api', database: 'up' };
    } catch {
      throw new ServiceUnavailableException({ status: 'error', service: '5ss-api', database: 'unavailable' });
    }
  }
}
