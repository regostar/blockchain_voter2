import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email } = createUserDto;
    
    // Check if user with username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }
    
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
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

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });
    
    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
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
