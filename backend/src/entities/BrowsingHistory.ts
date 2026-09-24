import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique, ManyToOne } from 'typeorm';
import { Book } from './Book';

@Entity('browsing_history')
@Unique(['userId', 'bookId'])
export class BrowsingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('idx_browse_user')
  userId: string;

  @ManyToOne(() => Book)
  book: Book;

  @Column()
  bookId: string;

  @CreateDateColumn()
  @Index('idx_browse_created')
  viewedAt: Date;
}
