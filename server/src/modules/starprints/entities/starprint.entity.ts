import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { PlayerSession } from '../../sessions/entities/player-session.entity';
import type { GlobalHiddenProfile, LegacyStarEffect, LegacyStarPalette, StarEffect, WingPalette } from '@5ss/contracts';

@Entity('starprints')
export class Starprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  sessionId: string;

  @OneToOne(() => PlayerSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: PlayerSession;

  @Column({ type: 'varchar', length: 7 })
  baseColor: string;

  /** Legacy 5D HSL palette — used by v1 starprints */
  @Column({ type: 'jsonb' })
  palette: LegacyStarPalette;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  effect: LegacyStarEffect | StarEffect;

  /** Legacy 5D profile — used by v1 starprints */
  @Column({ type: 'jsonb' })
  profile: {
    focus: number;
    explore: number;
    energy: number;
    social: number;
    adapt: number;
  } | GlobalHiddenProfile;

  /**
   * v2 OKLCH wing palette (5 hex colors, one per stage).
   * null for legacy v1 starprints.
   */
  @Column({ type: 'jsonb', nullable: true })
  wingPalette?: WingPalette | null;

  /**
   * v2 GlobalHiddenProfile (7 traits, all numeric).
   * null for legacy v1 starprints.
   */
  @Column({ type: 'jsonb', nullable: true })
  globalHiddenProfile?: GlobalHiddenProfile | null;

  @Column({ type: 'varchar', length: 7, nullable: true })
  signatureColor?: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true, unique: true })
  publicStarId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  modelVersion?: string | null;

  @Column({ type: 'varchar', nullable: true })
  paletteAlgorithmVersion?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date | null;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  consentPhoto: boolean;

  @Column({ type: 'boolean', default: false })
  consentName: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
