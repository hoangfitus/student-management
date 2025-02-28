import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DataService } from './data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';

@Controller()
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('import/csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          callback(null, `import-${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async importCSV(@UploadedFile() file: Express.Multer.File) {
    return this.dataService.importCSV(file.path);
  }

  @Post('import/excel')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          callback(null, `import-${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Query('sample') sample: string,
  ) {
    let filePath: string;

    // If sample query parameter is "true", use sample file from disk
    if (sample === 'true') {
      filePath = join(process.cwd(), 'sample', 'sample.xlsx');
    } else {
      // Otherwise, use the uploaded file
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      filePath = file.path;
    }

    // Call the service to process the file at filePath
    return this.dataService.importExcel(filePath);
  }

  @Get('export/csv')
  async exportCSV(@Res() res: Response) {
    const filePath = join(process.cwd(), 'exports', 'students.csv');
    try {
      await this.dataService.exportCSV(filePath);
      if (!fs.existsSync(filePath)) {
        throw new Error('Export file not found');
      }
      return res.download(filePath);
    } catch (error) {
      throw new HttpException(
        `Export CSV failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('export/excel')
  async exportExcel(@Res() res: Response) {
    const filePath = join(process.cwd(), 'exports', 'students.xlsx');
    try {
      await this.dataService.exportExcel(filePath);
      if (!fs.existsSync(filePath)) {
        throw new Error('Export file not found');
      }
      return res.download(filePath);
    } catch (error) {
      throw new HttpException(
        `Export Excel failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
