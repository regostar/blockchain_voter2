import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Vote } from '../../voting/entities/vote.entity';
import { Ballot } from '../../voting/entities/ballot.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ethers } from 'ethers';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  walletAddress: string;

  @Column({ nullable: true, select: false })
  privateKey: string;

  @Column({ nullable: true })
  voterToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Vote, vote => vote.user)
  votes: Vote[];

  @OneToMany(() => Ballot, ballot => ballot.creator)
  createdBallots: Ballot[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @BeforeInsert()
  async generateWallet() {
    console.log('Starting wallet generation for user:', this.username);
    
    if (!this.walletAddress) {
      try {
        // Create new wallet
        const wallet = ethers.Wallet.createRandom();
        console.log('Wallet created successfully:', {
          username: this.username,
          hasAddress: !!wallet.address,
          hasPrivateKey: !!wallet.privateKey
        });

        // Set wallet data
        this.walletAddress = wallet.address;
        this.privateKey = wallet.privateKey;
        
        // Generate voter token
        this.voterToken = this.generateVoterToken();
        
        console.log('Wallet data assigned:', {
          username: this.username,
          hasWalletAddress: !!this.walletAddress,
          hasPrivateKey: !!this.privateKey,
          hasVoterToken: !!this.voterToken
        });
      } catch (error) {
        console.error('Error in wallet generation:', {
          username: this.username,
          error: error.message,
          stack: error.stack
        });
        throw new Error(`Failed to generate wallet: ${error.message}`);
      }
    } else {
      console.log('Wallet already exists for user:', this.username);
    }
  }

  private generateVoterToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  toJSON() {
    const obj: Partial<this> = { ...this };
    delete obj.privateKey;
    delete obj.password;
    return obj;
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }

  async decryptPrivateKey(): Promise<string | null> {
    if (!this.privateKey) return null;
    
    const [ivHex, encrypted] = this.privateKey.split(':');
    const algorithm = 'aes-256-cbc';
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
} 