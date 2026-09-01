import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { PlayerSession } from '../../sessions/entities/player-session.entity';
import type { LegacyStarEffect, LegacyStarPalette } from '@5ss/contracts';

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

  @Column({ type: 'jsonb' })
  palette: LegacyStarPalette;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  effect: LegacyStarEffect;

  @Column({ type: 'jsonb' })
  profile: {
    focus: number;
    explore: number;
    energy: number;
    social: number;
    adapt: number;
  };

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
