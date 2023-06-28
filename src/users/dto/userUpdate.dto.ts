import { IsAlphanumeric, IsUrl, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateDto {
  @ApiProperty({ example: 'Antony', description: 'First name' })
  @IsAlphanumeric()
  @Length(2, 30)
  firstName?: string;

  @ApiProperty({ example: 'Starr', description: 'Last name' })
  @IsAlphanumeric()
  @Length(2, 30)
  lastName?: string;

  @ApiProperty({
    example: {
      thumbnail: 'https://example.com/thumbnail.jpg',
      original: 'https://example.com/original.jpg',
    },
    description: 'User avatar',
  })
  @IsUrl()
  avatar?: {
    thumbnail?: string;
    original?: string;
  };
}
