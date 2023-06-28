import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class GcpService {
  constructor() {}

  async uploadFile(name: string, filePath, bucket): Promise<string> {
    try {
      await bucket.upload(filePath);

      return `https://storage.googleapis.com/${bucket.name}/${name}`;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async deleteFile(name: string, bucket): Promise<object> {
    const file = bucket.file(name);

    return file.delete();
  }
}
