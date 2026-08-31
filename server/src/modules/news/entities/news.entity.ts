import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('news')
export class News {
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
  tag: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  /** null = draft; non-null = published */
  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
