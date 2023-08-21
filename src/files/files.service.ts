import {
  Bucket,
  DeleteFilesOptions,
  File,
  GetFilesOptions,
  Storage,
} from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
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
    let fileType: string;

    if (fileExt === 'pdf') {
      fileType = 'resume';
    } else if (fileExt === 'jpg' || fileExt === 'png' || fileExt === 'jpeg') {
      fileType = 'profilePic';
    }

    const fileName = `${user.firstName}_${user.lastName}_${fileType}.${fileExt}`;
    const gscFileName = `user-${user.id}/${fileName}`;
    const gscFile = this.bucket.file(gscFileName);

    const allowedTypes = this.allowedType(fileExt);

    if (allowedTypes.allowedImage) {
      await this.userService.updateUser(user.id, {
        imageUrl: fileName,
      });
    } else if (allowedTypes.allowedResume) {
      await this.userService.updateUser(user.id, {
        resumeUrl: fileName,
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

  async retrieveFiles(id?: number) {
    const streamOptions: GetFilesOptions = {};
    if (id) {
      const userFolderPath = `user-${id}`;
      streamOptions.prefix = `${userFolderPath}/`;
      streamOptions.autoPaginate = true;
    }

    this.bucket
      .getFilesStream(streamOptions)
      .on('data', (file: File) => {
        const fileStream = file.createReadStream();

        const localPath = '/Users/tahirmahmudzade/Desktop/hello';
        const folderPath = file.name.split('/')[0];
        const localFolderPath = join(localPath, folderPath);
        const finalFilePath = join(localPath, file.name);

        if (!existsSync(localFolderPath)) {
          mkdirSync(localFolderPath, { recursive: true });
        }

        const writableStream = createWriteStream(finalFilePath);

        fileStream.pipe(writableStream, { end: false });

        writableStream.on('finish', () => {
          console.log(`Downloaded file: ${file.name}`);
        });
      })
      .on('end', () => {
        console.log('all files downloaded');
      });
  }

  async deleteFiles(id?: number) {
    const streamOptions: DeleteFilesOptions = {};
    if (id) {
      const userFolderPath = `user-${id}`;
      streamOptions.prefix = `${userFolderPath}/`;
      streamOptions.autoPaginate = true;
      streamOptions.force = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.bucket.deleteFiles(streamOptions, (err, _files) => {
      if (err) {
        console.log(err);
      }
      console.log('Files Deleted');
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
