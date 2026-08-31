import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  READY_TO_GENERATE = 'READY_TO_GENERATE',
  GENERATED = 'GENERATED',
  PUBLISHED = 'PUBLISHED'
}

@Entity('player_sessions')
export class PlayerSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 24 })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.IN_PROGRESS })
  status: SessionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
