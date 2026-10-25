import { mapStarprintToSkyStar } from '../src/modules/sky/sky.service';
import { Starprint } from '../src/modules/starprints/entities/starprint.entity';
describe('Browser-only portraits', () => {
  it('does not expose legacy photos through Sky', () => {
    const star = { id: 'star', consentName: true, consentPhoto: true, palette: [], createdAt: new Date() } as unknown as Starprint;
    expect(mapStarprintToSkyStar(star, { nickname: 'Student', photoUrl: '/uploads/private.webp' }).photoUrl).toBeNull();
  });
});
