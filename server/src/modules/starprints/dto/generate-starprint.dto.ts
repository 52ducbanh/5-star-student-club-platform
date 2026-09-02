import { IsString, IsBoolean, Length, Matches, IsOptional } from 'class-validator';
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
  @ApiProperty({ description: 'Owner session ID required for authorization' })
  @IsString()
  sessionId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  consentName?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  consentPhoto?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  physicalCardRequested?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  mediaPermission?: boolean;
}
