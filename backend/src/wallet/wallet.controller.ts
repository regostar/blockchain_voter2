import { Controller, Post, Body, UseGuards, Req, Get, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Controller('wallet')
export class WalletController {
  constructor(
    private walletService: WalletService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('nonce')
  async getNonce(@Req() req) {
    return {
      nonce: await this.walletService.generateNonce(req.user.sub),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifyWallet(
    @Req() req,
    @Body('signature') signature: string,
    @Body('walletAddress') walletAddress: string,
  ) {
    if (!signature || !walletAddress) {
      throw new BadRequestException('Signature and wallet address are required');
    }

    const user = await this.userRepository.findOne({
      where: { id: req.user.sub },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify the wallet address format
    const isValidAddress = await this.walletService.verifyWalletAddress(walletAddress);
    if (!isValidAddress) {
      throw new BadRequestException('Invalid wallet address');
    }

    const isValid = await this.walletService.verifySignature(
      req.user.sub,
      signature,
      walletAddress,
    );

    if (isValid) {
      // Update user's wallet address and verification status
      user.walletAddress = walletAddress;
      user.isVerified = true;
      await this.userRepository.save(user);
    }

    return { 
      success: isValid,
      walletAddress: user.walletAddress,
      isVerified: user.isVerified
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Req() req) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.sub },
    });

    if (!user || !user.walletAddress) {
      throw new BadRequestException('User wallet not found');
    }

    return {
      balance: await this.walletService.getWalletBalance(user.walletAddress),
      walletAddress: user.walletAddress,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getWalletStatus(@Req() req) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.sub },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      walletAddress: user.walletAddress,
      isVerified: user.isVerified,
      balance: user.walletAddress ? await this.walletService.getWalletBalance(user.walletAddress) : '0',
    };
  }
} 