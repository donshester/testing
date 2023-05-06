import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeormModule } from './typeorm/typeorm.module';

@Module({
  imports: [UserModule, TypeormModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
