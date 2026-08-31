import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { PlayerSession } from '../../sessions/entities/player-session.entity';
import type { SubmitGameRequest } from '@5ss/contracts';

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

  @CreateDateColumn()
  createdAt: Date;
}
