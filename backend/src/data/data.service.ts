import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createReadStream, createWriteStream } from 'fs';
import * as xlsx from 'xlsx';
import * as csv from 'fast-csv';
import { Student } from '@prisma/client';

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
    // Giả sử số điện thoại cần có 10 chữ số, thêm số 0 ở đầu nếu thiếu
    return phoneStr.padStart(10, '0');
  }

  // Import Students from CSV
  async importCSV(filePath: string): Promise<Student[]> {
    const students: Student[] = [];
    this.logger.log(`Importing students from ${filePath}`);
    return new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(csv.parse({ headers: true }))
        .on('data', async (row) => {
          try {
            const student = await this.prisma.student.create({
              data: {
                mssv: row.mssv,
                name: row.name,
                dob: row.dob,
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
            console.error('Error importing student:', error);
          }
        })
        .on('end', () => resolve(students))
        .on('error', (error) => reject(error));
    });
  }

  private convertExcelSerialDateToLocaleDateString(serial: number): string {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const date = new Date(utcValue * 1000);

    return date.toLocaleDateString('vi-VN');
  }

  // Import Students from Excel
  async importExcel(filePath: string): Promise<Student[]> {
    const workbook = xlsx.readFile(filePath, {
      codepage: 65001,
    });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    this.logger.log(`Importing students from ${filePath}`);
    const students = await this.prisma.student.createMany({
      data: data.map((row: any) => ({
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
      })),
    });

    return this.prisma.student.findMany();
  }

  // Export Students to CSV
  async exportCSV(filePath: string): Promise<void> {
    const students = await this.prisma.student.findMany();
    const csvStream = csv.format({ headers: true });
    const writableStream = createWriteStream(filePath);

    csvStream.pipe(writableStream);
    students.forEach((student) => csvStream.write(student));
    csvStream.end();
    this.logger.log(`Exported students to ${filePath}`);
  }

  // Export Students to Excel
  async exportExcel(filePath: string): Promise<void> {
    const students = await this.prisma.student.findMany();
    const worksheet = xlsx.utils.json_to_sheet(students);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    xlsx.writeFile(workbook, filePath);
    this.logger.log(`Exported students to ${filePath}`);
  }
}
