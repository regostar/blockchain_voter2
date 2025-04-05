import { IsNotEmpty, IsUUID } from 'class-validator';

export class CastVoteDto {
  @IsUUID()
  @IsNotEmpty()
  ballotId: string;

  @IsUUID()
  @IsNotEmpty()
  candidateId: string;
} 