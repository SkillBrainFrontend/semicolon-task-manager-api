import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
  Res,
  UsePipes,
  ValidationPipe,
  Patch,
  Body,
} from '@nestjs/common';

import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';

import { UserService } from './user.service';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { join } from 'path';
import { ImageUploadService } from './image-upload/image-upload.service';
import { UpdateUserDto } from './dto/update-user.dto';

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
  constructor(
    private userService: UserService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @UseGuards(AuthGuard())
  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @UseGuards(AuthGuard())
  @Get('/logged-user')
  getLoggedUser(@Request() req): Promise<User> {
    return this.userService.getLoggedUser(req.user);
  }

  @UseGuards(AuthGuard())
  @Get('/details')
  getUserById(@Query('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @UseGuards(AuthGuard())
  @Post('/upload')
  async uploadFile(@Request() req, @Res() response): Promise<User> {
    try {
      await this.imageUploadService.fileupload(req, response);
    } catch (error) {
      return response
        .status(500)
        .json(`Failed to upload image file: ${error.message}`);
    }
  }

  @UseGuards(AuthGuard())
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch('/update')
  updateUser(@Request() req, @Body() updateUser: UpdateUserDto): Promise<User> {
    const loggedUser = req.user;
    console.log({ loggedUser, updateUser });
    return this.userService.updateUser(loggedUser, updateUser);
  }

  @Get('profile-image/:imagename')
  findProfileImage(
    @Param('imagename') imagename,
    @Res() res,
  ): Observable<User> {
    try {
      return of(
        res.sendFile(
          join(process.cwd(), 'uploads/profileimages/' + imagename),
          (err) => {
            if (err) {
              res.status(err.status).end();
            }
          },
        ),
      );
    } catch (e) {
      res.status(e.status).end();
    }
  }
}
