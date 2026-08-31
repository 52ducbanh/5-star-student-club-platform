import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { CreateSessionRequest } from '@5ss/contracts';

export class CreateSessionDto implements CreateSessionRequest {
  @ApiProperty({ description: 'Player nickname', maxLength: 24 })
  @IsString()
  @Length(1, 24)
  nickname: string;
}
