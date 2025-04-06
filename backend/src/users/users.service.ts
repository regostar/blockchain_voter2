import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: any): Promise<User> {
    try {
      console.log('Creating user with data:', {
        username: createUserDto.username,
        hasWalletAddress: !!createUserDto.walletAddress,
        hasPrivateKey: !!createUserDto.privateKey,
        hasVoterToken: !!createUserDto.voterToken
      });

      // Check if user with username or email already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { username: createUserDto.username },
          { email: createUserDto.email }
        ]
      });

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }

      // Validate wallet address if provided
      if (createUserDto.walletAddress && !ethers.isAddress(createUserDto.walletAddress)) {
        throw new BadRequestException('Invalid wallet address format');
      }

      // Create new user instance
      const user = new User();
      Object.assign(user, createUserDto);

      // Save the user
      const savedUser = await this.userRepository.save(user);
      console.log('User saved to database:', {
        id: savedUser.id,
        username: savedUser.username,
        hasWalletAddress: !!savedUser.walletAddress,
        hasVoterToken: !!savedUser.voterToken
      });

      return savedUser;
    } catch (error) {
      console.error('Error creating user:', {
        message: error.message,
        stack: error.stack,
        details: error
      });
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // If updating wallet address, validate it
    if (updateUserDto.walletAddress && !ethers.isAddress(updateUserDto.walletAddress)) {
      throw new BadRequestException('Invalid wallet address format');
    }

    // If updating password, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  async generateVoterToken(userId: string): Promise<string> {
    const user = await this.findOne(userId);
    const voterToken = uuidv4();
    
    user.voterToken = voterToken;
    await this.userRepository.save(user);
    
    return voterToken;
  }

  async verifyUser(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    
    user.isVerified = true;
    return this.userRepository.save(user);
  }
}
