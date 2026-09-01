import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { LegacyGameRawResult, SubmitGameRequest } from '@5ss/contracts';

export class SubmitGameDto implements SubmitGameRequest {
  @ApiProperty({ description: 'Raw game results' })
  @IsObject()
  rawResult: LegacyGameRawResult;
}
