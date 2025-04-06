import { Controller, Post, Body, UseGuards, Req, Get, BadRequestException, Param } from '@nestjs/common';
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
  @Get('nonce/:userId')
  async getNonce(@Param('userId') userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const nonce = await this.walletService.generateNonce(userId);
    return { nonce };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify/:userId')
  async verifyWallet(
    @Param('userId') userId: string,
    @Body('signature') signature: string,
    @Body('walletAddress') walletAddress: string,
    @Body('message') message: string,
  ) {
    if (!signature || !walletAddress || !message) {
      throw new BadRequestException('Signature, wallet address, and message are required');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify the wallet address format
    const isValidAddress = await this.walletService.verifyWalletAddress(walletAddress);
    if (!isValidAddress) {
      throw new BadRequestException('Invalid wallet address');
    }

    // Extract nonce from message for verification
    const nonceMatch = message.match(/Nonce: (0x[a-fA-F0-9]+)/);
    if (!nonceMatch || !nonceMatch[1]) {
      throw new BadRequestException('Invalid message format');
    }
    
    const nonce = nonceMatch[1];
    
    // Verify the signature matches the expected signer (the wallet address)
    const isValid = await this.walletService.verifySignature(
      userId,
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
  @Post('update/:userId')
  async updateWalletAddress(
    @Param('userId') userId: string,
    @Body('walletAddress') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new BadRequestException('Wallet address is required');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify the wallet address format
    const isValidAddress = await this.walletService.verifyWalletAddress(walletAddress);
    if (!isValidAddress) {
      throw new BadRequestException('Invalid wallet address');
    }

    // Update user's wallet address
    user.walletAddress = walletAddress;
    await this.userRepository.save(user);

    return {
      success: true,
      walletAddress: user.walletAddress
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:userId')
  async getWalletStatus(@Param('userId') userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
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