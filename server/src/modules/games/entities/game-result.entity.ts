import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { PlayerSession } from '../../sessions/entities/player-session.entity';
import type { LocalTraitProfile, SubmitGameRequest } from '@5ss/contracts';

export enum GameType {
  SOLVE = 'solve',
  SENSE = 'sense',
  SPRINT = 'sprint',
  SUPPORT = 'support',
  SYNC = 'sync'
}

@Entity('game_results')
@Unique(['sessionId', 'gameId'])
export class GameResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  sessionId: string;

  @ManyToOne(() => PlayerSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: PlayerSession;

  @Column({ type: 'enum', enum: GameType })
  gameId: GameType;

  @Column({ type: 'jsonb' })
  rawResult: SubmitGameRequest['rawResult'];

  /**
   * Computed 7D LocalTraitProfile for official v2 games.
   * null for legacy v1 submissions.
   */
  @Column({ type: 'jsonb', nullable: true })
  localTraitProfile?: LocalTraitProfile | null;

  @Column({ type: 'varchar', nullable: true })
  payloadVersion?: string | null;

  @Column({ type: 'varchar', nullable: true })
  contentVersion?: string | null;

  @Column({ type: 'varchar', nullable: true })
  scoringVersion?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  rawExpiresAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
