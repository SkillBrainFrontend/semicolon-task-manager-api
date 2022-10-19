// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Req, Res, Injectable } from '@nestjs/common';
import * as multerS3 from 'multer-s3';
import * as multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import { UserService } from '../user.service';

const AWS_S3_BUCKET_NAME = 'semicolontaskmanager';
const AWS_ACCESS_KEY_ID = 'AKIASA2ZFP3ID4UXAI5M';
const AWS_SECRET_ACCESS_KEY = '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';

const s3 = new S3Client({
  region: 'eu-central-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

@Injectable()
export class ImageUploadService {
  constructor(private userService: UserService) {}

  async fileupload(@Req() req, @Res() res) {
    const userService = this.userService;
    try {
      this.upload(req, res, async function (error) {
        if (error) {
          console.log(error);
          return res.status(404).json(`Failed to upload image file: ${error}`);
        }
        const created = await userService.uploadProfilePicture(
          req.user,
          req.files[0].location,
        );
        return res.status(201).json(created);
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(`Failed to upload image file: ${error}`);
    }
  }

  upload = multer({
    storage: multerS3({
      s3: s3 as any,
      bucket: AWS_S3_BUCKET_NAME,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (request, file, cb) {
        cb(null, `${Date.now().toString()} - ${file.originalname}`);
      },
    }),
  }).array('file', 1);
}
