import {
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class UploadFilePipe implements PipeTransform {
  constructor(
    private readonly fileType: string,
    private readonly sizeMb: number,
  ) {}
  transform(value: Express.Multer.File) {
    return new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize: 1024 * 1024 * this.sizeMb,
          message(maxSize) {
            return `File is too large. Max file size is ${
              maxSize / 1024 / 1024
            } MB`;
          },
        }),
        new FileTypeValidator({
          fileType: new RegExp(this.fileType),
        }),
      ],
    }).transform(value);
  }
}
