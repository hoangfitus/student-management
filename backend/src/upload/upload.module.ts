import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

@Module({
  imports: [MulterModule.register()],
  controllers: [UploadController],
  providers: [UploadService, Logger],
})
export class UploadModule {}
