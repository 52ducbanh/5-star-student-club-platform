import { mapStarprintToSkyStar } from '../src/modules/sky/sky.service';
import { Starprint } from '../src/modules/starprints/entities/starprint.entity';
import { PlayerSession } from '../src/modules/sessions/entities/player-session.entity';
import { StarprintsService } from '../src/modules/starprints/starprints.service';
import { DomainException } from '../src/common/exceptions/domain.exception';
import { DomainErrorCode } from '../src/common/exceptions/domain-error.enum';

describe('P1 Authorization & P2 Sky Payload Verification', () => {
  describe('P2: Canonical Sky Payload Mapper (mapStarprintToSkyStar)', () => {
    it('maps starprint and session to canonical SkyStar with publicStarId as id and wingPalette preferred', () => {
      const sp = {
        id: '11111111-1111-1111-1111-111111111111',
        publicStarId: 'STAR-ABCD1234',
        baseColor: '#ffd467',
        palette: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff'],
        wingPalette: ['#ffd467', '#6cd5f7', '#5fe3a1', '#b794f6', '#ff5c5c'] as any,
        type: 'STRATEGIST',
        effect: 'SHIMMER',
        consentName: true,
        consentPhoto: true,
        createdAt: new Date('2026-09-02T12:00:00.000Z'),
      } as Starprint;

      const session = {
        nickname: 'TestUser',
        photoUrl: '/uploads/test.webp',
      } as PlayerSession;

      const skyStar = mapStarprintToSkyStar(sp, session);

      expect(skyStar.id).toBe('STAR-ABCD1234');
      expect(skyStar.baseColor).toBe('#ffd467');
      expect(skyStar.palette).toEqual(sp.wingPalette);
      expect(skyStar.wingPalette).toEqual(sp.wingPalette);
      expect(skyStar.type).toBe('STRATEGIST');
      expect(skyStar.effect).toBe('SHIMMER');
      expect(skyStar.nickname).toBe('TestUser');
      expect(skyStar.photoUrl).toBe('/uploads/test.webp');
      expect(skyStar.createdAt).toBe('2026-09-02T12:00:00.000Z');
    });

    it('falls back to DB UUID if publicStarId is missing and legacy palette if wingPalette is null', () => {
      const sp = {
        id: '22222222-2222-2222-2222-222222222222',
        publicStarId: null,
        baseColor: '#6cd5f7',
        palette: ['#111111', '#222222', '#333333', '#444444', '#555555'],
        wingPalette: null,
        type: 'navigator',
        effect: 'flow',
        consentName: true,
        consentPhoto: false,
        createdAt: new Date('2026-09-02T12:00:00.000Z'),
      } as unknown as Starprint;

      const session = {
        nickname: 'LegacyUser',
        photoUrl: '/uploads/legacy.webp',
      } as PlayerSession;

      const skyStar = mapStarprintToSkyStar(sp, session);

      expect(skyStar.id).toBe('22222222-2222-2222-2222-222222222222');
      expect(skyStar.palette).toEqual(sp.palette);
      expect(skyStar.wingPalette).toBeNull();
      expect(skyStar.nickname).toBe('LegacyUser');
      expect(skyStar.photoUrl).toBeNull(); // consentPhoto is false
    });
  });

  describe('P1: StarprintsService Publish Authorization', () => {
    let service: StarprintsService;
    let mockStarprintRepo: any;

    beforeEach(() => {
      mockStarprintRepo = {
        findOne: jest.fn(),
        save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      };

      service = new StarprintsService(
        mockStarprintRepo,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        { emitStarCreated: jest.fn() } as any,
        {} as any,
      );
    });

    it('rejects mutation when publicStarId is used as target ID (UNAUTHORIZED_MUTATION)', async () => {
      await expect(
        service.publish('STAR-PUBLIC12', {
          sessionId: '33333333-3333-3333-3333-333333333333',
          physicalCardRequested: false,
        }),
      ).rejects.toThrow(DomainException);

      try {
        await service.publish('STAR-PUBLIC12', {
          sessionId: '33333333-3333-3333-3333-333333333333',
        });
      } catch (err: any) {
        expect(err.code).toBe(DomainErrorCode.UNAUTHORIZED_MUTATION);
        expect(err.getStatus()).toBe(403);
      }
    });

    it('rejects mutation when wrong sessionId is provided (UNAUTHORIZED_SESSION)', async () => {
      const starprintUuid = '44444444-4444-4444-4444-444444444444';
      const ownerSessionId = 'owner-session-111';

      mockStarprintRepo.findOne.mockResolvedValue({
        id: starprintUuid,
        sessionId: ownerSessionId,
        physicalCardRequested: true,
        mediaPermission: true,
      });

      try {
        await service.publish(starprintUuid, {
          sessionId: 'attacker-session-999',
          physicalCardRequested: false,
        });
        fail('Should have thrown');
      } catch (err: any) {
        expect(err.code).toBe(DomainErrorCode.UNAUTHORIZED_SESSION);
        expect(err.getStatus()).toBe(403);
      }
    });

    it('succeeds mutation when valid UUID and matching owner sessionId are provided', async () => {
      const starprintUuid = '44444444-4444-4444-4444-444444444444';
      const ownerSessionId = 'owner-session-111';

      const existingRecord: any = {
        id: starprintUuid,
        sessionId: ownerSessionId,
        physicalCardRequested: true,
        mediaPermission: true,
      };

      mockStarprintRepo.findOne.mockResolvedValue(existingRecord);

      await service.publish(starprintUuid, {
        sessionId: ownerSessionId,
        physicalCardRequested: false,
        mediaPermission: false,
      });

      expect(existingRecord.physicalCardRequested).toBe(false);
      expect(existingRecord.mediaPermission).toBe(false);
      expect(existingRecord.consentName).toBe(true);
      expect(existingRecord.consentPhoto).toBe(true);
      expect(mockStarprintRepo.save).toHaveBeenCalledWith(existingRecord);
    });
  });
});