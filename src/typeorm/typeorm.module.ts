import { Module } from '@nestjs/common';
import { appDataSource } from './typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...appDataSource.options, autoLoadEntities: true }),
  ],
})
export class TypeormModule {}
