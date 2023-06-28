import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserUpdateDto } from './dto/userUpdate.dto';
import { User, UserDocument } from './users.model';
import { UploadAvatarDto } from 'src/upload-aws/dto/uploadAvatar.dto';
import storage from '../config/gcp-storage';
import * as path from 'path';
import { extname } from 'path';
import { GcpService } from '../gcp/gcp.service';
import * as fs from 'fs';

const bucket = storage.bucket('nest-js');

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private gcpService: GcpService,
  ) { }

  async createUser(user: User): Promise<UserDocument> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find();
  }

  async getUser(id: string): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async updateUser(id: string, data: UserUpdateDto): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteUser(id: string): Promise<UserDocument> {
    return this.userModel.findByIdAndDelete(id);
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  async updateUserPassword(
    id: string,
    password: string,
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, { password }, { new: true });
  }

  async updateUserAvatar(
    file: Express.Multer.File,
    userId,
  ): Promise<UserDocument> {
    try {
      const originalName = path.parse(file.filename).name;
      const ext = extname(file.filename);
      const thumbImageName = `${originalName}x32${ext}`;
      const thumbImagePath = path.join('src', 'static', thumbImageName);

      const originalImageUrl = await this.gcpService.uploadFile(
        file.filename,
        file.path,
        bucket,
      );
      const sharpedImageUrl = await this.gcpService.uploadFile(
        thumbImageName,
        thumbImagePath,
        bucket,
      );
      const userRecord = await this.getUser(userId);

      if (userRecord.avatar) {
        try {
          await this.gcpService.deleteFile(
            userRecord.avatar.original.split(`${bucket.name}/`)[1],
            bucket,
          );
          await this.gcpService.deleteFile(
            userRecord.avatar.thumbnail.split(`${bucket.name}/`)[1],
            bucket,
          );
        } catch (e) {
          throw e;
        }
      }

      await fs.promises.unlink(file.path);
      await fs.promises.unlink(thumbImagePath);

      return this.updateUser(userId, {
        avatar: {
          thumbnail: sharpedImageUrl,
          original: originalImageUrl,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateUserAvatarMi(data: UploadAvatarDto, id: string) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }
}
