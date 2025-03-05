import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
  Param,
} from '@nestjs/common';
import { DataService } from './data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';

@Controller()
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string,
    @Query('sample') sample: string,
  ) {
    if (type === 'csv') {
      return this.dataService.importCSV(file);
    } else if (type === 'excel') {
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
  }

  @Get('export')
  async export(@Res() res: Response, @Query('type') type: string) {
    if (type === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
      const csvStream = await this.dataService.generateCSVData();
      csvStream.pipe(res);
    } else if (type === 'excel') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=students.xlsx',
      );
      const excelBuffer = await this.dataService.generateExcelBuffer();
      res.send(excelBuffer);
    }
  }

  @Get('export/certificate/:id')
  async exportCertificate(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('type') type: string = 'pdf',
    @Query('reason') reason: string,
  ) {
    const certificate = await this.dataService.generateCertificate(id, reason);

    if (type.toLowerCase() === 'md') {
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=certificate.md',
      );
      return res.send(certificate.content);
    } else if (type.toLowerCase() === 'pdf') {
      return res.status(200).json({
        school: certificate.school,
        from: certificate.from.toLocaleDateString('vi-VN'),
        to: certificate.to.toLocaleDateString('vi-VN'),
      });
    }
  }
}
