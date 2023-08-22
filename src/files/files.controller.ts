import {
  Controller,
  Delete,
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
import { Request } from 'express';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@ApiBearerAuth('Access Token')
@UseGuards(AccessTokenGuard)
@UseGuards(AuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a resume',
  })
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

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image',
  })
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

  @UseGuards(AdminGuard)
  @Get('retrieveAllFiles')
  async retrieveAllFiles() {
    const files = await this.filesService.retrieveFiles();
    return files;
  }

  @UseGuards(AdminGuard)
  @Get('retrieveFiles/:id')
  async retrieveUserFiles(@Param('id') id: string) {
    const files = await this.filesService.retrieveFiles(parseInt(id));
    return files;
  }

  @UseGuards(AdminGuard)
  @Delete('deleteAllFiles')
  async deleteAllFiles() {
    return this.filesService.deleteFiles();
  }

  @UseGuards(AdminGuard)
  @Delete('deleteFiles/:id')
  async deleteUserFiles(@Param('id') id: string) {
    return this.filesService.deleteFiles(parseInt(id));
  }
}
