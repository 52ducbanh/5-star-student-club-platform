import { IsString, IsBoolean, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type {
  GenerateStarprintRequest,
  PublishStarprintRequest,
} from '@5ss/contracts';

export class GenerateStarprintDto implements GenerateStarprintRequest {
  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty({ example: '#ff0000' })
  @IsString()
  @Length(7, 7)
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  baseColor: string;
}

export class PublishStarprintDto implements PublishStarprintRequest {
  @ApiProperty()
  @IsBoolean()
  consentName: boolean;

  @ApiProperty()
  @IsBoolean()
  consentPhoto: boolean;
}
