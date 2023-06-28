import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './config/mongo.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GcpModule } from './gcp/gcp.module';
import { UploadAwsModule } from './upload-aws/upload-aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    UsersModule,
    AuthModule,
    GcpModule,
    UploadAwsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
