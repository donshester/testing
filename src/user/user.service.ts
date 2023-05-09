import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordService } from './password.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseInterface } from './interface/user-response.interface';
import * as process from 'process';
import { sign } from 'jsonwebtoken';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    const user: UserEntity = this.userRepository.create({
      ...createUserDto,
      hashedPassword,
    });
    return this.userRepository.save(user);
  }
  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {
        'email or password': 'is invalid',
      },
    };
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
    });
    if (!user) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const isPasswordCorrect = await this.passwordService.comparePassword(
      loginUserDto.password,
      user.hashedPassword,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return user;
  }
  private generateJwt(user: UserEntity): string {
    return sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.SECRET_KEY,
    );
  }
  buildUserResponse(user: UserEntity): UserResponseInterface {
    const { hashedPassword, pdf, image, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, token: this.generateJwt(user) };
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
