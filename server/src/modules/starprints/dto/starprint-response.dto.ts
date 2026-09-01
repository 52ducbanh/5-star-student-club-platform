import { ApiProperty } from '@nestjs/swagger';
import type {
  LegacyStarEffect,
  LegacyStarPalette,
  StarprintResponse,
  StarprintType,
} from '@5ss/contracts';

export class StarprintTypeDto implements StarprintType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

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
  effect: LegacyStarEffect;

  @ApiProperty({ type: [String] })
  palette: LegacyStarPalette;

  @ApiProperty()
  baseColor: string;

  @ApiProperty()
  isPublic: boolean;
}
