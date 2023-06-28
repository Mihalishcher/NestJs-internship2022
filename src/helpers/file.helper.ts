import { UnprocessableEntityException } from '@nestjs/common';
import { extname } from 'path';
import { randomUUID } from 'node:crypto';
import { Request } from 'express';

export const imageTypeValidation = (
  req: Request,
  file: Express.Multer.File,
  callback: any,
): void => {
  if (!file.originalname.match(/\.(jpg|png)/)) {
    return callback(
      new UnprocessableEntityException('Image can be only [jpg, png] types'),
      false,
    );
  }
  callback(null, true);
};
export const randomizeFileName = (
  req: Request,
  file: Express.Multer.File,
  callback: any,
): void => {
  const ext = extname(file.originalname);
  const uniqueSuffix = `${randomUUID()}-${Date.now()}`;
  const fileName = `${uniqueSuffix}${ext}`;

  callback(null, fileName);
};

export const resizeImage = async (url: string, imageBuffer: Buffer) => {
  const response = await fetch(url, {
    method: 'POST',
    body: imageBuffer.toString('base64'),
  });

  return response.text();
};
