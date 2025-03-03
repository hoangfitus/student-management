import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as csv from 'fast-csv';
import { Student } from '@prisma/client';
import { Readable } from 'stream';

@Injectable()
export class DataService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  private formatPhone(phone: string | number): string {
    let phoneStr = '';
    if (typeof phone === 'number') {
      phoneStr = phone.toString();
    } else if (typeof phone === 'string') {
      phoneStr = phone;
    }
    // Assuming the phone number should have 10 digits; pad with leading zeros if missing
    return phoneStr.padStart(10, '0');
  }

  private convertExcelSerialDateToLocaleDateString(serial: number): string {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const date = new Date(utcValue * 1000);
    return date.toLocaleDateString('vi-VN');
  }

  async importCSV(file: Express.Multer.File): Promise<Student[]> {
    const students: Student[] = [];
    // Convert file buffer to a readable stream
    const stream = Readable.from(file.buffer.toString());
    this.logger.log(`Importing students from ${file.originalname}`);

    return new Promise<Student[]>((resolve, reject) => {
      stream
        .pipe(csv.parse({ headers: true }))
        .on('error', (error) => {
          this.logger.error(
            `Error reading CSV file: ${error.message}`,
            error.stack,
          );
          reject(
            new BadRequestException(`Error reading CSV file: ${error.message}`),
          );
        })
        .on('data', async (row) => {
          try {
            const student = await this.prisma.student.create({
              data: {
                mssv: row.mssv,
                name: row.name,
                dob: row.dob, // CSV data is assumed to be in valid format
                gender: row.gender,
                faculty: row.faculty,
                course: row.course.toString(),
                program: row.program,
                address: row.address,
                email: row.email,
                phone: this.formatPhone(row.phone),
                status: row.status,
              },
            });
            students.push(student);
          } catch (error) {
            // Log the error for this row and continue processing the remaining rows.
            this.logger.error(
              `Error importing row ${JSON.stringify(row)}: ${error.message}`,
            );
          }
        })
        .on('end', () => resolve(students));
    });
  }

  async importExcel(file: Express.Multer.File): Promise<Student[]> {
    try {
      // Read the workbook from the file buffer
      const workbook = xlsx.read(file.buffer, {
        type: 'buffer',
        codepage: 65001,
      });

      // Get the first sheet name
      const sheetName = workbook.SheetNames[0];
      // Parse the sheet to JSON
      const worksheet = workbook.Sheets[sheetName];
      const data: { [key: string]: any }[] =
        xlsx.utils.sheet_to_json(worksheet);
      this.logger.log(
        `Importing students from ${file.filename || file.originalname}`,
      );

      // Process each row individually so that invalid rows do not block others.
      const insertedStudents: Student[] = [];
      for (const row of data) {
        try {
          const student = await this.prisma.student.create({
            data: {
              mssv: row.mssv.toString(),
              name: row.name,
              dob: this.convertExcelSerialDateToLocaleDateString(row.dob),
              gender: row.gender,
              faculty: row.faculty,
              course: row.course.toString(),
              program: row.program,
              address: row.address,
              email: row.email,
              phone: this.formatPhone(row.phone),
              status: row.status,
            },
          });
          insertedStudents.push(student);
        } catch (error) {
          // Log the error for this row and continue processing other rows.
          this.logger.error(
            `Error importing row ${JSON.stringify(row)}: ${error.message}`,
          );
        }
      }
      return insertedStudents;
    } catch (error) {
      this.logger.error(
        `Error processing Excel file: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error processing Excel file: ${error.message}`,
      );
    }
  }

  async generateCSVData(): Promise<csv.CsvFormatterStream<any, any>> {
    try {
      const students = await this.prisma.student.findMany();
      const csvStream = csv.format({ headers: true });
      students.forEach((student) => {
        csvStream.write(student);
      });
      csvStream.end();
      this.logger.log('Generated CSV stream');
      return csvStream;
    } catch (error) {
      this.logger.error(
        `Error generating CSV data: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error generating CSV data: ${error.message}`,
      );
    }
  }

  async generateExcelBuffer(): Promise<Buffer> {
    try {
      const students = await this.prisma.student.findMany();
      const worksheet = xlsx.utils.json_to_sheet(students);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
      const excelBuffer = xlsx.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });
      this.logger.log('Generated Excel buffer');
      return excelBuffer;
    } catch (error) {
      this.logger.error(
        `Error generating Excel buffer: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error generating Excel buffer: ${error.message}`,
      );
    }
  }
}
