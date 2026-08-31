import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { SubmitGameRequest } from '@5ss/contracts';

export class SubmitGameDto implements SubmitGameRequest {
  @ApiProperty({ description: 'Raw game results' })
  @IsObject()
  rawResult: Record<string, unknown>;
}
