import { ApiProperty } from '@nestjs/swagger';
import type {
  GlobalHiddenProfile,
  LegacyStarEffect,
  LegacyStarPalette,
  StarEffect,
  StarprintResponse,
  StarprintType,
  WingPalette,
} from '@5ss/contracts';

export class StarprintTypeDto implements StarprintType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  tagline?: string;

  @ApiProperty()
  description: string;
}

export class StarprintResponseDto implements StarprintResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty({ required: false, nullable: true })
  photoUrl: string | null;

  @ApiProperty({ type: StarprintTypeDto })
  type: StarprintTypeDto;

  @ApiProperty()
  effect: LegacyStarEffect | StarEffect;

  @ApiProperty({ type: [String] })
  palette: LegacyStarPalette | WingPalette;

  @ApiProperty({ type: [String], required: false, nullable: true })
  wingPalette?: WingPalette | null;

  @ApiProperty()
  baseColor: string;

  @ApiProperty({ required: false })
  signatureColor?: string;

  @ApiProperty({ required: false, nullable: true })
  publicStarId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  globalProfile7D?: GlobalHiddenProfile | null;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty({ required: false })
  publishedToSky?: boolean;

  @ApiProperty({ required: false })
  physicalCardRequested?: boolean;

  @ApiProperty({ required: false })
  mediaPermission?: boolean;

  @ApiProperty({ required: false, nullable: true })
  eventId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  eventEdition?: string | null;
}
