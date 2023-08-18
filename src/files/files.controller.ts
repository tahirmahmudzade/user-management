import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFilePipe } from 'src/common/pipes/uploadFilePipe.pipe';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';

@UseGuards(AccessTokenGuard)
@UseGuards(AuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('uploadResume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile(
      new UploadFilePipe(
        'application/msword|application/pdf|application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        10,
      ),
    )
    resume: Express.Multer.File,
    @Req() req: Request,
  ) {
    const uploadedResume = await this.filesService.uploadFile(
      resume,
      req.user['id'],
    );
    return uploadedResume;
  }

  @Post('uploadImage')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(new UploadFilePipe('image/png|image.jpg|image.jpeg', 5))
    image: Express.Multer.File,
    @Req() req: Request,
  ) {
    const uploadedImage = await this.filesService.uploadFile(
      image,
      req.user['id'],
    );

    return uploadedImage;
  }

  @Get('retrieveAllFiles')
  async retrieveAllFiles() {
    const files = await this.filesService.retrieveFiles();
    return files;
  }

  @Get('retrieveFiles/:id')
  async retrieveUserFiles(@Param('id') id: number) {
    const files = await this.filesService.retrieveFiles(id);
    return files;
  }
}
