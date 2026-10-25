import { ExecutionContext, HttpException } from '@nestjs/common';
import { WriteRateLimitGuard } from '../src/common/guards/write-rate-limit.guard';

describe('Public write rate limits', () => {
  let guard: WriteRateLimitGuard;
  const header = jest.fn();
  const context = (path = '/api/contact', ip = '192.0.2.1', method = 'POST') => ({
    switchToHttp: () => ({ getRequest: () => ({path, ip, method}), getResponse: () => ({setHeader: header}) }),
  }) as unknown as ExecutionContext;
  beforeEach(() => { guard = new WriteRateLimitGuard(); jest.useFakeTimers(); header.mockReset(); });
  afterEach(() => jest.useRealTimers());
  it('rejects repeated contact submissions with a bounded retry time', () => {
    for (let i = 0; i < 10; i++) expect(guard.canActivate(context())).toBe(true);
    try { guard.canActivate(context()); throw new Error('Expected rejection'); }
    catch (e) { expect(e).toBeInstanceOf(HttpException); expect((e as HttpException).getStatus()).toBe(429); }
    expect(header).toHaveBeenCalledWith('Retry-After', 60);
    expect(guard.canActivate(context('/api/contact', '192.0.2.2'))).toBe(true);
    jest.advanceTimersByTime(60000);
    expect(guard.canActivate(context())).toBe(true);
  });
  it('groups event registrations across event IDs', () => {
    for (let i = 0; i < 20; i++) guard.canActivate(context(`/api/events/${i}/registrations`));
    expect(() => guard.canActivate(context('/api/events/another/registrations'))).toThrow(HttpException);
  });
  it('allows shared-network gameplay and excludes health and game submissions', () => {
    for (let i = 0; i < 120; i++) expect(guard.canActivate(context('/api/sessions'))).toBe(true);
    expect(() => guard.canActivate(context('/api/sessions'))).toThrow(HttpException);
    for (let i = 0; i < 200; i++) {
      expect(guard.canActivate(context('/api/health/ready', '192.0.2.1', 'GET'))).toBe(true);
      expect(guard.canActivate(context('/api/sessions/id/games/solve'))).toBe(true);
    }
  });
});
