import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  excerpt: string;

  /** Array of paragraph strings */
  @Column({ type: 'jsonb' })
  body: string[];

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'timestamptz' })
  startAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  registrationDeadline: Date | null;

  /** null = unlimited capacity */
  @Column({ type: 'integer', nullable: true })
  capacity: number | null;

  /** Manual kill-switch for registration */
  @Column({ type: 'boolean', default: true })
  registrationEnabled: boolean;

  /** false = draft, true = publicly visible */
  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
