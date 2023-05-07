import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  async createUser(userDto: CreateUserDto): Promise<UserEntity> {
    return;
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    return;
  }

  async updateUserByEmail(email: string, updateUserDto: UpdateUserDto) {}
  // ): Promise<UserEntity> {}

  async deleteUserByEmail(email: string): Promise<void> {}
}
