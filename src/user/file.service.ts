import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as fs from 'fs';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {}

  async uploadImage(imageFile: Express.Multer.File): Promise<string> {
    return await fs.promises.readFile(imageFile.path, 'base64');
  }

  createDataURLFromBase64(base64String: string, fileFormat: string): string {
    const mimeType = `image/${fileFormat}`;
    return `data:${mimeType};base64,${base64String}`;
  }
  getImageFormat(base64String: string): string {
    console.log(base64String.slice(0,10))
    if (base64String.slice(0, 8) === '/9j/4AAQ') {
      return 'jpg';
    } else if (base64String.slice(0, 10) === '/9j/4AAQSk') {
      return 'jpeg';
    } else if (base64String.slice(0, 10) === 'iVBORw0KGg') {
      return 'png';
    } else {
      throw new Error('Unknown image format');
    }
  }

  async generatePdf(email: string): Promise<boolean> {
    try {
      const user = await this.userService.getUserByEmail(email);
      const dataUrl = this.createDataURLFromBase64(
        user.image,
        this.getImageFormat(user.image),
      );
      const docDefinition = {
        content: [
          {
            text: `${user.firstName} ${user.lastName}`,
            fontSize: 20,
            bold: true,
            alignment: 'center',
          },
          { image: dataUrl, alignment: 'center' },
        ],
      };
      const pdfDoc = pdfMake.createPdf(docDefinition);
      user.pdf = await new Promise<Buffer>((resolve, reject) => {
        pdfDoc.getBuffer(
          (buffer: Buffer) => {
            resolve(buffer);
          },
          (error: any) => {
            reject(error);
          },
        );
      });
      await this.userRepository.save(user);
      return true;
    } catch (error) {
      return false;
    }
  }

  // async savePdfToUser(user: UserEntity, pdfFile: Buffer): Promise<UserEntity>{}
}
