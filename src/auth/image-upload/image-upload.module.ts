import { Module } from '@nestjs/common';
import { UserService } from '../user.service';
import { ImageUploadService } from './image-upload.service';
import { UsersRepository } from '../users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UsersRepository])],
  providers: [ImageUploadService, UserService],
  exports: [ImageUploadService],
})
export class ImageUploadModule {}
