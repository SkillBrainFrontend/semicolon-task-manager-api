import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';

import { UserService } from './user.service';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { join } from 'path';

import * as fs from 'fs';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileimages',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('user')
export class UserControler {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard())
  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @UseGuards(AuthGuard())
  @Get('/details')
  getUserById(@Query('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @UseGuards(AuthGuard())
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', storage))
  async uploadFile(@UploadedFile() file, @Request() req): Promise<User> {
    const user: User = req.user;
    try {
      const filePath = path.join(
        './uploads/profileimages',
        user.profilePicture,
      );
      fs.unlink(filePath, (err) => {
        //delete file from directory
        if (err) console.log(err);
        else {
          console.log('file deleted');
        }
      });
    } catch (e) {
      return e.message;
    }
    return await this.userService.uploadProfilePicture(user, file.filename);
  }

  @Get('profile-image/:imagename')
  findProfileImage(
    @Param('imagename') imagename,
    @Res() res,
  ): Observable<User> {
    try {
      const resolvedPath = path.resolve('uploads/profileimages/' + imagename);
      return of(
        res.sendFile(join(process.cwd(), resolvedPath), (err) => {
          if (err) {
            res.status(err.status).end();
          }
        }),
      );
    } catch (e) {
      return e.errorMessage;
    }
  }
}
