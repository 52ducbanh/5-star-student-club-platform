import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class WriteRateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, { count: number; until: number }>();
  private nextSweep = 0;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method !== 'POST') return true;
    const path = request.path.replace(/\/$/, '');
    const limit = path === '/api/contact' ? 10
      : /^\/api\/events\/[^/]+\/registrations$/.test(path) ? 20
      : path === '/api/sessions' ? 120 : 0;
    if (!limit) return true;
    const now = Date.now();
    if (now >= this.nextSweep) {
      for (const [key, value] of this.windows) if (value.until <= now) this.windows.delete(key);
      this.nextSweep = now + 60000;
    }
    // Group event registrations together so changing event IDs cannot bypass the limit.
    const group = path.startsWith('/api/events/') ? 'registrations' : path;
    const key = `${group}:${request.ip || 'unknown'}`;
    let window = this.windows.get(key);
    if (!window || window.until <= now) {
      if (this.windows.size >= 10000) this.reject(context, 60);
      window = { count: 0, until: now + 60000 };
      this.windows.set(key, window);
    }
    if (++window.count > limit) this.reject(context, Math.ceil((window.until - now) / 1000));
    return true;
  }

  private reject(context: ExecutionContext, retryAfter: number): never {
    context.switchToHttp().getResponse<Response>().setHeader('Retry-After', retryAfter);
    throw new HttpException({ code: 'RATE_LIMITED', message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau một phút.' }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
