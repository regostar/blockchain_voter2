import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Ballot } from './ballot.entity';
import { Vote } from './vote.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => Ballot, (ballot) => ballot.candidates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ballot_id' })
  ballot: Ballot;

  @Column({ name: 'ballot_id' })
  ballotId: string;

  @OneToMany(() => Vote, vote => vote.candidate)
  votes: Vote[];
} 