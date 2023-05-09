import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { UserService } from './user.service';
import { FileService } from './file.service';
import { UserGuard } from './guards/user.guard';
import { UserResponseInterface } from './interface/user-response.interface';
import { User } from './decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

  @Post('/image')
  @UseGuards(UserGuard)
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
    @UploadedFile() imageFile: Express.Multer.File,
    @User() user: UserResponseInterface,
  ) {
    const basedImage: string = await this.fileService.uploadImage(imageFile);
    await this.userService.updateUserByEmail(user.email, { image: basedImage });
  }

  @Post('/pdf')
  @UseGuards(UserGuard)
  async generatePdf(@User('email') email: string) {
    const result = await this.fileService.generatePdf(email);
    return { success: result };
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }
  @Get()
  @UseGuards(UserGuard)
  async getUserByEmail(
    @User('email') email: string,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.getUserByEmail(email);
    return this.userService.buildUserResponse(user);
  }
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @Put()
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe())
  async updateUserByEmail(
    @User('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUserByEmail(email, updateUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Delete()
  @UseGuards(UserGuard)
  async deleteUserByEmail(@User('email') email: string): Promise<void> {
    return this.userService.deleteUserByEmail(email);
  }
}
