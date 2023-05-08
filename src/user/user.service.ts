import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const newUser = await this.userRepository.create({ ...createUserDto });
    return await this.userRepository.save(newUser);
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ email: email });
    if (!user) {
      throw new NotFoundException(`User with email ${user.email} not found.`);
    }

    return user;
  }
  async updateUserByEmail(
    email: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ email: email });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return await this.userRepository.save({ ...user, ...updateUserDto });
  }

  async deleteUserByEmail(email: string): Promise<void> {
    const result = await this.userRepository.delete({ email });

    if (result.affected === 0) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
  }
}
