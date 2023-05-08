import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}
  @Post(':email/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = path.extname(file.originalname) || '.png';
          cb(null, file.fieldname + '-' + uniqueSuffix + extension);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 10, //10 mb
      },
      fileFilter: (_, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files provided'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @Param('email') email: string,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    const url: string = await this.fileService.uploadImage(imageFile);
    await this.userService.updateUserByEmail(email, { image: url });
  }
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.createUser(createUserDto);
  }

  @Get(':email')
  async getUserByEmail(@Param('email') email: string): Promise<UserEntity> {
    return this.userService.getUserByEmail(email);
  }

  @Put(':email')
  async updateUserByEmail(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.updateUserByEmail(email, updateUserDto);
  }

  @Delete(':email')
  async deleteUserByEmail(@Param('email') email: string): Promise<void> {
    return this.userService.deleteUserByEmail(email);
  }
}
