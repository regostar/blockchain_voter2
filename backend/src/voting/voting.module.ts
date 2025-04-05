import { Module } from '@nestjs/common';
import { VotingService } from './voting.service';
import { VotingController } from './voting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ballot } from './entities/ballot.entity';
import { Candidate } from './entities/candidate.entity';
import { Vote } from './entities/vote.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ballot, Candidate, Vote]),
    BlockchainModule,
    UsersModule,
  ],
  providers: [VotingService],
  controllers: [VotingController],
  exports: [VotingService],
})
export class VotingModule {}
