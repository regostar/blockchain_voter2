import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ballot } from './ballot.entity';
import { Candidate } from './candidate.entity';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Ballot)
  @JoinColumn({ name: 'ballot_id' })
  ballot: Ballot;

  @Column({ name: 'ballot_id' })
  ballotId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'candidate_id' })
  candidateId: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
} 