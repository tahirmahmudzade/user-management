import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { UserService } from 'src/user/user.service';

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
    const currentDate = DateTime.local().toFormat('yyyy-MM-dd-HH-mm-ss');
    const gscFileName = `user-${user.id}-${currentDate}.${fileExt}`;
    const gscFile = this.bucket.file(gscFileName);

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
}
