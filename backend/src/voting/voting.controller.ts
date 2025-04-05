import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { VotingService } from './voting.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Ballot } from './entities/ballot.entity';
import { Vote } from './entities/vote.entity';

@Controller('voting')
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  /* Ballot Management (Admin Only) */
  @Post('ballots')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createBallot(@Body() createBallotDto: CreateBallotDto): Promise<Ballot> {
    return this.votingService.createBallot(createBallotDto);
  }

  @Get('ballots')
  async getAllBallots(): Promise<Ballot[]> {
    return this.votingService.findAllBallots();
  }

  @Get('ballots/active')
  async getActiveBallots(): Promise<Ballot[]> {
    return this.votingService.findActiveBallots();
  }

  @Get('ballots/:id')
  async getBallotById(@Param('id') id: string): Promise<Ballot> {
    return this.votingService.findBallotById(id);
  }

  @Put('ballots/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateBallot(
    @Param('id') id: string,
    @Body() updateBallotDto: Partial<CreateBallotDto>,
  ): Promise<Ballot> {
    return this.votingService.updateBallot(id, updateBallotDto);
  }

  @Delete('ballots/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBallot(@Param('id') id: string): Promise<void> {
    return this.votingService.deleteBallot(id);
  }

  /* Voting */
  @Post('cast-vote')
  @UseGuards(JwtAuthGuard)
  async castVote(@Request() req, @Body() castVoteDto: CastVoteDto): Promise<Vote> {
    return this.votingService.castVote(req.user.userId, castVoteDto);
  }

  @Get('my-votes')
  @UseGuards(JwtAuthGuard)
  async getUserVotes(@Request() req): Promise<Vote[]> {
    return this.votingService.getUserVotes(req.user.userId);
  }

  @Get('results/:ballotId')
  async getBallotResults(@Param('ballotId') ballotId: string) {
    return this.votingService.getBallotResults(ballotId);
  }
}
