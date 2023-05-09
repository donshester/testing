import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    const salt = CryptoJS.lib.WordArray.random();
    const hash = CryptoJS.SHA256(salt + password);
    return salt + hash;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const salt = hash.substr(0, 32);
    const hashToCheck = salt + CryptoJS.SHA256(salt + password);
    return hashToCheck === hash;
  }
}
