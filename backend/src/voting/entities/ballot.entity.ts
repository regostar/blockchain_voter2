import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  ManyToOne
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Candidate } from './candidate.entity';
import { Vote } from './vote.entity';

@Entity('ballots')
export class Ballot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => User, user => user.createdBallots)
  creator: User;

  @OneToMany(() => Candidate, (candidate) => candidate.ballot, {
    cascade: true,
    eager: true,
  })
  candidates: Candidate[];

  @OneToMany(() => Vote, vote => vote.ballot)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 