import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ballot } from './entities/ballot.entity';
import { Candidate } from './entities/candidate.entity';
import { Vote } from './entities/vote.entity';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class VotingService {
  constructor(
    @InjectRepository(Ballot)
    private ballotRepository: Repository<Ballot>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    private blockchainService: BlockchainService,
    private usersService: UsersService,
  ) {}

  async createBallot(createBallotDto: CreateBallotDto): Promise<Ballot> {
    const { candidates, ...ballotData } = createBallotDto;
    
    // Create the ballot without candidates first
    const ballot = this.ballotRepository.create(ballotData);
    const savedBallot = await this.ballotRepository.save(ballot);
    
    // Create and associate candidates
    const candidateEntities = candidates.map(candidate => 
      this.candidateRepository.create({
        ...candidate,
        ballot: savedBallot,
        ballotId: savedBallot.id,
      })
    );
    
    savedBallot.candidates = await this.candidateRepository.save(candidateEntities);
    return savedBallot;
  }

  async findAllBallots(): Promise<Ballot[]> {
    return this.ballotRepository.find({
      relations: ['candidates'],
    });
  }

  async findActiveBallots(): Promise<Ballot[]> {
    return this.ballotRepository.find({
      where: { isActive: true },
      relations: ['candidates'],
    });
  }

  async findBallotById(id: string): Promise<Ballot> {
    const ballot = await this.ballotRepository.findOne({
      where: { id },
      relations: ['candidates'],
    });
    
    if (!ballot) {
      throw new NotFoundException(`Ballot with ID "${id}" not found`);
    }
    
    return ballot;
  }

  async updateBallot(id: string, updateBallotDto: Partial<CreateBallotDto>): Promise<Ballot> {
    const ballot = await this.findBallotById(id);
    
    const { candidates, ...ballotData } = updateBallotDto;
    
    // Update ballot properties
    Object.assign(ballot, ballotData);
    await this.ballotRepository.save(ballot);
    
    // Update candidates if provided
    if (candidates && candidates.length > 0) {
      // Remove existing candidates
      await this.candidateRepository.delete({ ballotId: id });
      
      // Create new candidates
      const candidateEntities = candidates.map(candidate => 
        this.candidateRepository.create({
          ...candidate,
          ballot,
          ballotId: id,
        })
      );
      
      ballot.candidates = await this.candidateRepository.save(candidateEntities);
    }
    
    return ballot;
  }

  async deleteBallot(id: string): Promise<void> {
    const result = await this.ballotRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Ballot with ID "${id}" not found`);
    }
  }

  async castVote(userId: string, castVoteDto: CastVoteDto): Promise<Vote> {
    const { ballotId, candidateId } = castVoteDto;
    
    // Verify the ballot and candidate exist
    const ballot = await this.findBallotById(ballotId);
    
    if (!ballot.isActive) {
      throw new UnauthorizedException('This ballot is not active');
    }
    
    const candidateExists = ballot.candidates.some(c => c.id === candidateId);
    if (!candidateExists) {
      throw new NotFoundException(`Candidate with ID "${candidateId}" not found in this ballot`);
    }
    
    // Check if user has already voted
    const existingVote = await this.voteRepository.findOne({
      where: { 
        user: { id: userId },
        ballot: { id: ballotId }
      },
    });
    
    if (existingVote) {
      throw new ConflictException('You have already voted in this ballot');
    }
    
    // Get user info for voter token
    const user = await this.usersService.findOne(userId);
    
    if (!user.isVerified) {
      throw new UnauthorizedException('User is not verified');
    }
    
    if (!user.voterToken) {
      throw new UnauthorizedException('User does not have a voter token');
    }
    
    // Cast vote on blockchain
    const blockchainResult = await this.blockchainService.castVote(
      ballotId,
      candidateId,
      user.voterToken,
    );
    
    // Save vote in database
    const vote = this.voteRepository.create({
      user: { id: userId },
      ballot: { id: ballotId },
      candidate: { id: candidateId },
      transactionHash: blockchainResult.transactionHash,
      status: 'confirmed',
    });
    
    return this.voteRepository.save(vote);
  }

  async getUserVotes(userId: string): Promise<Vote[]> {
    return this.voteRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['user', 'ballot', 'candidate'],
    });
  }

  async getBallotResults(ballotId: string) {
    // First check if the ballot exists
    await this.findBallotById(ballotId);
    
    // Get blockchain tally
    return this.blockchainService.getVoteTally(ballotId);
  }

  async getVotesByUser(userId: string, ballotId: string): Promise<Vote[]> {
    return this.voteRepository.find({
      where: {
        user: { id: userId },
        ballot: { id: ballotId },
      },
      relations: ['user', 'ballot', 'candidate'],
    });
  }

  async createVote(voteData: Partial<Vote>): Promise<Vote> {
    const vote = this.voteRepository.create(voteData);
    return this.voteRepository.save(vote);
  }

  async getVotesByVoterToken(voterToken: string): Promise<Vote[]> {
    return this.voteRepository.find({
      where: {
        user: { voterToken },
      },
      relations: ['user', 'ballot', 'candidate'],
    });
  }
}
