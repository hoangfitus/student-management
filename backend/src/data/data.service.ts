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

  private generateCertificateContent(
    student: Student,
    school: {
      name: string;
      address: string;
      phone: string;
      email: string;
    },
    reason: string,
    from: Date,
    to: Date,
  ): string {
    return `
### **GIẤY XÁC NHẬN TÌNH TRẠNG SINH VIÊN**  

Trường ${school.name} xác nhận:  

**1. Thông tin sinh viên:**  
- **Họ và tên:** ${student.name}  
- **Mã số sinh viên:** ${student.mssv}  
- **Ngày sinh:** ${student.dob}  
- **Giới tính:** ${student.gender}  
- **Khoa:** ${student.faculty}  
- **Chương trình đào tạo:** ${student.program}  
- **Khóa:** K${student.course}  

**2. Tình trạng sinh viên hiện tại:** 
- ${student.status}

**3. Mục đích xác nhận:**  
- ${reason}

**4. Thời gian cấp giấy:**  
- Giấy xác nhận có hiệu lực đến ngày: ${to.toLocaleDateString('vi-VN')}

📍 **Xác nhận của Trường Đại học ${school.name}**  

📅 Ngày cấp: ${from.toLocaleDateString('vi-VN')}  

🖋 **Trưởng Phòng Đào Tạo**  
(Ký, ghi rõ họ tên, đóng dấu)
`;
  }

  async generateCertificate(
    id: string,
    reason: string,
  ): Promise<{
    school: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
    from: Date;
    to: Date;
    content: string;
  }> {
    try {
      const student = await this.prisma.student.findUnique({
        where: { mssv: id },
      });
      if (!student) {
        throw new BadRequestException('Student not found');
      }

      const schoolName = await this.prisma.config.findUnique({
        where: { name: 'school_name' },
      });
      const schoolAddress = await this.prisma.config.findUnique({
        where: { name: 'school_address' },
      });
      const schoolPhone = await this.prisma.config.findUnique({
        where: { name: 'school_phone' },
      });
      const schoolEmail = await this.prisma.config.findUnique({
        where: { name: 'school_email' },
      });

      if (!schoolName || !schoolAddress || !schoolPhone || !schoolEmail) {
        throw new BadRequestException('School information not found');
      }

      const from = new Date();

      if (!reason) {
        throw new BadRequestException('Reason is required');
      }

      let to: Date;
      if (reason === 'Xác nhận đang học để vay vốn ngân hàng') {
        // Hiệu lực 6 tháng cho vay vốn ngân hàng
        to = new Date(from.getTime() + 180 * 24 * 60 * 60 * 1000);
      } else if (reason === 'Xác nhận làm thủ tục tạm hoãn nghĩa vụ quân sự') {
        // Hiệu lực 12 tháng cho hoãn nghĩa vụ quân sự
        to = new Date(from.getTime() + 365 * 24 * 60 * 60 * 1000);
      } else if (reason === 'Xác nhận làm hồ sơ xin việc / thực tập') {
        // Hiệu lực 3 tháng cho xin việc/thực tập
        to = new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000);
      } else {
        // Mặc định 1 tháng cho các trường hợp khác
        to = new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      const school = {
        name: schoolName.value,
        address: schoolAddress.value,
        phone: schoolPhone.value,
        email: schoolEmail.value,
      };
      const content = this.generateCertificateContent(
        student,
        school,
        reason,
        from,
        to,
      );
      this.logger.log(
        `Generating certificate for ${student.name} with reason ${reason}`,
      );
      return {
        school,
        from,
        to,
        content,
      };
    } catch (error) {
      this.logger.error(
        `Error generating certificate: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error generating certificate: ${error.message}`,
      );
    }
  }
}
