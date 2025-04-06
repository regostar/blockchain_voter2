import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ballot } from './ballot.entity';
import { Candidate } from './candidate.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  encryptedVote: string;

  @ManyToOne(() => Ballot, ballot => ballot.votes)
  ballot: Ballot;

  @ManyToOne(() => Candidate, candidate => candidate.votes)
  candidate: Candidate;

  @ManyToOne(() => User, user => user.votes)
  user: User;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
} 