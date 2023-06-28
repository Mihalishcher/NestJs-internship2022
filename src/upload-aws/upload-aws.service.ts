import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';

@Injectable()
export class UploadAwsService {
  constructor(private configService: ConfigService) { }

  s3 = new AWS.S3({
    secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
  });

  async uploadAvatar(name: string, buffer: Buffer) {
    const params = {
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
      Key: name,
      Body: buffer,
      ACL: 'public-read',
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: this.configService.get<string>('AWS_REGION'),
      },
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (e) {
      throw e;
    }
  }
}
