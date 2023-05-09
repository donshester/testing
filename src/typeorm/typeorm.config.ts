import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as process from 'process';
import { join } from 'path';
import { UserEntity } from '../user/user.entity';

config({ path: join(process.cwd(), '.env') });
const configService = new ConfigService();

const options = (): DataSourceOptions => {
  return {
    host: process.env.POSTGRES_HOST,
    port: parseInt(<string>process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    type: 'postgres',
    logging: configService.get('IS_PROD') === 'false',
    entities: [UserEntity],
    synchronize: true,
  };
};
export const appDataSource = new DataSource(options());
