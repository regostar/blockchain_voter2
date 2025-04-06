import { DefaultNamingStrategy } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class CustomNamingStrategy extends DefaultNamingStrategy {
  generateUUID(): string {
    return uuidv4();
  }
} 