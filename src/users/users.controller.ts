import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserDocument } from './users.model';
import { UserUpdateDto } from './dto/userUpdate.dto';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UploadAwsService } from 'src/upload-aws/upload-aws.service';
import { UploadAvatarDto } from 'src/upload-aws/dto/uploadAvatar.dto';
import { SharpMiPipe } from 'src/upload-aws/pipes/sharpMi.pipe';
import { diskStorage } from 'multer';
import { randomizeFileName, imageTypeValidation } from '../helpers/file.helper';
import { SharpPipe } from '../pipes/sharp.pipe';
import * as path from 'path';
import MongooseClassSerializerInterceptor from 'src/config/mongooseClassSerializer.interceptor';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadAwsService: UploadAwsService,
  ) { }

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 200, type: User })
  @Post()
  async createUser(@Body() userDto: User): Promise<UserDocument> {
    return this.usersService.createUser(userDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  @Get()
  async getAllUsers(): Promise<UserDocument[]> {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: User })
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserDocument> {
    return this.usersService.getUser(id);
  }

  @ApiOperation({ summary: 'Patch user by id' })
  @ApiResponse({ status: 200, type: User })
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updatedData: UserUpdateDto,
  ): Promise<UserDocument> {
    return this.usersService.updateUser(id, updatedData);
  }

  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({ status: 200, type: User })
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<UserDocument> {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload user Avatar' })
  @ApiResponse({ status: 200, type: User })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: path.join('src', 'static'),
        filename: randomizeFileName,
      }),
      limits: {
        fileSize: 2000000,
      },
      fileFilter: imageTypeValidation,
    }),
  )
  @Post('/change-avatar')
  async changeUserAvatar(
    @UploadedFile(SharpPipe) file: Express.Multer.File,
    @Req() req,
  ): Promise<UserDocument> {
    return this.usersService.updateUserAvatar(file, req.user.id);
  }

  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 201, type: User })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @Post('/upload')
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /.(jpg|jpeg|png)$/ }),
          new MaxFileSizeValidator({ maxSize: 2000000 }),
        ],
      }),
      SharpMiPipe,
    )
    file: Express.Multer.File,
    @Req() req,
  ): Promise<UserDocument> {
    const { id } = req.user;
    const { originalname, buffer } = file;
    const original = `${id}/${originalname.split('.')[0]}`;
    const thumbName = `${original}x32`;

    async function resizeImg(url: string, data: Buffer): Promise<any> {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data.toString('base64')),
      });
      return response.json();
    }

    const thumbBuffer: Buffer = await resizeImg(
      'https://europe-central2-eminent-bond-374921.cloudfunctions.net/sharp',
      buffer,
    ).then((resp) => {
      return Buffer.from(resp.data, 'base64');
    });

    const originalWebp = await this.uploadAwsService.uploadAvatar(
      `${original}.webp`,
      buffer,
    );
    const thumbnailWebp = await this.uploadAwsService.uploadAvatar(
      `${thumbName}.webp`,
      thumbBuffer,
    );

    const data: UploadAvatarDto = {
      avatar: {
        thumbnail: thumbnailWebp.Location,
        original: originalWebp.Location,
      },
    };

    return await this.usersService.updateUserAvatarMi(data, id);
  }
}
