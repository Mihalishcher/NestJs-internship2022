import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import EnvEnum from './enums/env.enum';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) { }

  createMongooseOptions(): MongooseModuleOptions {
    switch (process.env.NODE_ENV) {
      case EnvEnum.Dev:
        return {
          uri: this.configService.get<string>('DEV_DB_URL'),
        };

      case EnvEnum.Prod:
        return {
          uri: this.configService.get<string>('PROD_DB_URL'),
        };

      default:
        return {
          uri: this.configService.get<string>('TEST_DB_URL'),
        };
    }
  }
}
