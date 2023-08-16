import { Bucket, File, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { DateTime } from 'luxon';
import { UserService } from 'src/user/user.service';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  private readonly storage: Storage;
  private bucket: Bucket;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.storage = new Storage({
      projectId: this.configService.get<string>('GC_PROJECT_ID'),
      keyFilename: this.configService.get<string>('GC_KEY_FILE'),
    });

    this.bucket = this.storage.bucket(
      this.configService.get<string>('GC_BUCKET_NAME'),
    );
  }

  async uploadFile(file: Express.Multer.File, userId: number) {
    const user = await this.userService.findUserWithUnique({
      id: userId,
    });
    const fileExt = `${file.originalname.split('.')[1]}`;

    // const currentDate = DateTime.local().toFormat('yyyy-MM-dd-HH-mm-ss');

    const gscFileName = `${user.id}_${user.firstName}_${user.lastName}.${fileExt}`;
    const gscFile = this.bucket.file(gscFileName);

    const allowedTypes = this.allowedType(fileExt);

    if (allowedTypes.allowedImage) {
      await this.userService.updateUser(user.id, {
        imageUrl: gscFileName,
      });
    } else if (allowedTypes.allowedResume) {
      await this.userService.updateUser(user.id, {
        resumeUrl: gscFileName,
      });
    }

    const stream = gscFile.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((res, rej) => {
      stream.on('error', (err) => rej(err));
      stream.on('finish', () => res(gscFileName));
      stream.end(file.buffer);
    });
  }

  async retrieveFiles() {
    const localPath = '/Users/tahirmahmudzade/Desktop/hello';

    this.bucket
      .getFilesStream()
      .on('data', (file: File) => {
        const fileStream = file.createReadStream();
        const localFilePath = join(localPath, file.name);
        const writableStream = createWriteStream(localFilePath);

        fileStream.pipe(writableStream, { end: false });

        writableStream.on('finish', () => {
          console.log(`Downloaded file: ${file.name}`);
        });
      })
      .on('end', () => {
        console.log('all files downloaded');
      });
  }

  private allowedType = (fileExt: string) => {
    const allowedImageExtentions = ['.jpg', '.jpeg', '.png'];
    const allowedResumeExtentions = ['.pdf', '.doc', '.docx'];

    const allowedImage = allowedImageExtentions.includes(`.${fileExt}`);
    const allowedResume = allowedResumeExtentions.includes(`.${fileExt}`);

    return {
      allowedImage,
      allowedResume,
    };
  };
}
