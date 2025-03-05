import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', UploadService.multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const cloudinaryUrl = await this.uploadService.uploadToCloudinary(file);
    return { url: this.uploadService.getFileUrl(cloudinaryUrl) };
  }
}
