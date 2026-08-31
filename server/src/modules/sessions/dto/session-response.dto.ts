import { ApiProperty } from '@nestjs/swagger';
import type {
  GameId,
  SessionResponse,
  SessionStatus,
} from '@5ss/contracts';

export class SessionResponseDto implements SessionResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty({ required: false, nullable: true })
  photoUrl: string | null;

  @ApiProperty()
  status: SessionStatus;

  @ApiProperty({ type: [String] })
  completedGameIds: GameId[];

  @ApiProperty({ required: false, nullable: true })
  starprintId: string | null;
}
