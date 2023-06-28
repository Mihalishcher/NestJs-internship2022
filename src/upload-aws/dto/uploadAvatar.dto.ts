import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiProperty({
    example: {
      thumbnail: 'https://example.com/thumbnail.jpg',
      original: 'https://example.com/original.jpg',
    },
    description: 'User avatar',
  })
  avatar: {
    thumbnail: string;
    original: string;
  };
}
