import { Injectable, PipeTransform } from '@nestjs/common';
import { resizeImage } from '../helpers/file.helper';
import * as path from 'path';
import { extname } from 'path';
import * as sharp from 'sharp';
import * as fs from 'fs';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    const imageBuffer = await fs.promises.readFile(file.path);
    const originalName = path.parse(file.filename).name;
    const ext = extname(file.filename);
    const thumbImageName = `${originalName}x32${ext}`;

    await sharp(imageBuffer)
      .webp({ quality: 20 })
      .toFile(path.join('src', 'static', file.filename));

    const thumbBuffer = await resizeImage(
      process.env.LINK_TO_IMAGE_RESIZE,
      imageBuffer,
    );

    await fs.promises.writeFile(
      path.join('src', 'static', thumbImageName),
      Buffer.from(thumbBuffer, 'base64'),
    );

    return file;
  }
}
