import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.DB_SYNC === 'true',
  uuidExtension: 'pgcrypto',
  extra: {
    generateUUID: () => uuidv4(),
  },
  ssl: {
    rejectUnauthorized: false // Required for Neon.tech connection
  }
}; 