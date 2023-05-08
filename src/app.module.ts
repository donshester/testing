import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeormModule } from './typeorm/typeorm.module';
import { FileService } from './user/file.service';

@Module({
  imports: [UserModule, TypeormModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
