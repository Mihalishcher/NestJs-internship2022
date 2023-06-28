import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsEmail, IsNotEmpty, IsAlphanumeric, Length } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema()
export class User {
  @ApiProperty({ example: 'Antony', description: 'First name' })
  @Prop({ required: true })
  @IsAlphanumeric()
  @Length(2, 30)
  firstName: string;

  @ApiProperty({ example: 'Starr', description: 'Last name' })
  @Prop({ required: true })
  @IsAlphanumeric()
  @Length(2, 30)
  lastName: string;

  @ApiProperty({ example: 'user@gmail.com', description: 'Email address' })
  @Prop({ required: true, unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', description: 'User password' })
  @Prop({ required: true })
  @IsAlphanumeric()
  @Length(8, 30)
  @Exclude()
  password: string;

  @ApiProperty({
    example: {
      thumbnail: 'https://example.com/thumbnail.jpg',
      original: 'https://example.com/original.jpg',
    },
    description: 'User avatar',
  })
  @Prop({ type: Object, required: false })
  avatar: {
    thumbnail: string;
    original: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});
