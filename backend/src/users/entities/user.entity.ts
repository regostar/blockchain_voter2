import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Vote } from '../../voting/entities/vote.entity';
import { Ballot } from '../../voting/entities/ballot.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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
  @BeforeUpdate()
  async encryptPrivateKey() {
    if (this.privateKey && !this.privateKey.includes(':')) {
      const algorithm = 'aes-256-cbc';
      const secret = process.env.JWT_SECRET || 'default-secret-key';
      const key = crypto.scryptSync(secret, 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(this.privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      this.privateKey = `${iv.toString('hex')}:${encrypted}`;
    }
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