import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletService {
  private provider: ethers.JsonRpcProvider;
  private nonceMap: Map<string, { nonce: string; timestamp: number }> = new Map();
  private readonly NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  constructor(private configService: ConfigService) {
    // Initialize Ganache provider
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
  }

  async generateNonce(userId: string): Promise<string> {
    // Generate a secure random nonce
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    this.nonceMap.set(userId, {
      nonce,
      timestamp: Date.now()
    });
    return nonce;
  }

  private cleanupExpiredNonces(): void {
    const now = Date.now();
    for (const [userId, data] of this.nonceMap.entries()) {
      if (now - data.timestamp > this.NONCE_EXPIRY) {
        this.nonceMap.delete(userId);
      }
    }
  }

  async verifySignature(
    userId: string,
    signature: string,
    walletAddress: string,
  ): Promise<boolean> {
    this.cleanupExpiredNonces();
    
    const nonceData = this.nonceMap.get(userId);
    if (!nonceData) {
      throw new Error('Nonce not found or expired');
    }

    try {
      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(nonceData.nonce, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    } finally {
      // Clear the nonce after verification attempt
      this.nonceMap.delete(userId);
    }
  }

  async getWalletBalance(walletAddress: string): Promise<string> {
    const balance = await this.provider.getBalance(walletAddress);
    return ethers.formatEther(balance);
  }

  async getTransactionCount(walletAddress: string): Promise<number> {
    return await this.provider.getTransactionCount(walletAddress);
  }

  async verifyWalletAddress(walletAddress: string): Promise<boolean> {
    try {
      return ethers.isAddress(walletAddress);
    } catch (error) {
      return false;
    }
  }
} 