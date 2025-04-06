import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: { username: string; password: string }) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    const payload = { 
      username: user.username,
      sub: user.id,
      isVerified: user.isVerified
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified
      }
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async verifyPrivateKey(userId: string, privateKey: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    // Implement your private key verification logic here
    return true;
  }

  async verifyAndUpdateWallet(userId: string, privateKey: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    // Implement your wallet verification and update logic here
    return true;
  }

  async getVoterToken(userId: string, privateKey: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    // Implement your voter token generation logic here
    return 'voter-token';
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async register(createUserDto: any) {
    try {
      console.log('Starting registration process for:', createUserDto.username);
      
      // Check if user already exists
      const existingUser = await this.usersService.findByUsername(createUserDto.username);
      if (existingUser) {
        throw new BadRequestException('Username already registered');
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

      // Create user with hashed password
      // The wallet will be automatically generated in the User entity @BeforeInsert hook
      const userData = {
        ...createUserDto,
        password: hashedPassword,
      };

      // Create user - wallet will be generated automatically
      const user = await this.usersService.create(userData);

      console.log('User created successfully:', {
        id: user.id,
        username: user.username,
        hasWalletAddress: !!user.walletAddress,
        hasVoterToken: !!user.voterToken
      });

      // Fetch the complete user with private key for the response
      const completeUser = await this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.username',
          'user.email',
          'user.walletAddress',
          'user.privateKey',
          'user.isVerified'
        ])
        .where('user.id = :id', { id: user.id })
        .getOne();

      if (!completeUser || !completeUser.walletAddress) {
        throw new Error('Failed to generate wallet for user');
      }

      // Log wallet generation success
      console.log('Wallet generated successfully:', {
        userId: completeUser.id,
        hasWalletAddress: !!completeUser.walletAddress,
        hasPrivateKey: !!completeUser.privateKey
      });

      return {
        id: completeUser.id,
        username: completeUser.username,
        email: completeUser.email,
        walletAddress: completeUser.walletAddress,
        isVerified: completeUser.isVerified,
        message: 'Please save your private key securely',
        privateKey: completeUser.privateKey
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  private generateVoterToken(walletAddress: string): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    return this.jwtService.sign(
      { walletAddress, type: 'voter' },
      { secret, expiresIn: '1y' }
    );
  }

  async verifyWallet(userId: string, signature: string, message: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.walletAddress) {
      return false;
    }

    try {
      const signerAddress = ethers.verifyMessage(message, signature);
      return signerAddress.toLowerCase() === user.walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  async updateWalletAddress(userId: string, walletAddress: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify the wallet address format
    if (!ethers.isAddress(walletAddress)) {
      throw new UnauthorizedException('Invalid wallet address');
    }

    user.walletAddress = walletAddress;
    await this.userRepository.save(user);

    return { success: true };
  }
}
