import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
} from '@nestjs/common';
import { DataService } from './data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { Student } from '@prisma/client';

@Controller()
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCSV(@UploadedFile() file: Express.Multer.File) {
    return this.dataService.importCSV(file);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Query('sample') sample: string,
  ): Promise<Student[]> {
    if (sample === 'true') {
      const sampleFilePath = join(process.cwd(), 'sample', 'sample.xlsx');
      const sampleFileBuffer = fs.readFileSync(sampleFilePath);
      return this.dataService.importExcel({
        buffer: sampleFileBuffer,
      } as Express.Multer.File);
    } else {
      return this.dataService.importExcel(file);
    }
  }

  @Get('export/csv')
  async exportCSV(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    const csvStream = await this.dataService.generateCSVData();
    csvStream.pipe(res);
  }

  @Get('export/excel')
  async exportExcel(@Res() res: Response) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    const excelBuffer = await this.dataService.generateExcelBuffer();
    res.send(excelBuffer);
  }
}
