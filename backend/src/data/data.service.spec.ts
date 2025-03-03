import { BadRequestException } from '@nestjs/common';
import { DataService } from './data.service';
import { PrismaService } from '../prisma/prisma.service';
import { Student } from '@prisma/client';
import * as csv from 'fast-csv';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';

describe('DataService', () => {
  let service: DataService;
  let prismaService: PrismaService;
  let logger: { log: jest.Mock; error: jest.Mock };

  beforeEach(() => {
    prismaService = {
      student: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
    } as unknown as PrismaService;

    logger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    service = new DataService(prismaService, logger as any);
  });

  describe('importCSV', () => {
    it('should import valid rows and skip invalid rows', async () => {
      // Create a CSV with two rows: one valid and one that will fail.
      const csvContent = `mssv,name,dob,gender,faculty,course,program,address,email,phone,status
20000001,Test Student,2000-01-15,Nam,Test Faculty,2020,Test Program,Test Address,test@example.com,0123456789,Active
20000002,Invalid Student,invalid-date,Nam,Test Faculty,2020,Test Program,Test Address,test2@example.com,0123456789,Active`;
      const fakeFile = {
        originalname: 'students.csv',
        buffer: Buffer.from(csvContent, 'utf-8'),
      } as Express.Multer.File;

      const validStudent: Student = {
        mssv: '20000001',
        name: 'Test Student',
        dob: '2000-01-15',
        gender: 'Nam',
        faculty: 'Test Faculty',
        course: '2020',
        program: 'Test Program',
        address: 'Test Address',
        email: 'test@example.com',
        phone: '0123456789',
        status: 'Active',
      };

      // Simulate successful creation for the first row,
      // and throw an error for the second row.
      (prismaService.student.create as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve(validStudent))
        .mockImplementationOnce(() => {
          throw new Error('Invalid date format');
        });

      const result = await service.importCSV(fakeFile);
      // Expect only the valid student to be returned.
      expect(result).toEqual([validStudent]);
      // Verify that an error was logged for the failed row.
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error importing row'),
      );
    });

    it('should reject if CSV stream fails', async () => {
      // To simulate a CSV parsing error, override csv.parse to emit an error.
      const fakeFile = {
        originalname: 'students.csv',
        buffer: Buffer.from('invalid csv data', 'utf-8'),
      } as Express.Multer.File;
      const parseSpy = jest.spyOn(csv, 'parse').mockImplementation(() => {
        const stream = new Readable();
        process.nextTick(() => stream.emit('error', new Error('CSV error')));
        return stream as any;
      });
      await expect(service.importCSV(fakeFile)).rejects.toThrow(
        BadRequestException,
      );
      parseSpy.mockRestore();
    });
  });

  describe('importExcel', () => {
    it('should import valid rows and skip invalid rows', async () => {
      // Create sample Excel data with two rows.
      const sampleData = [
        {
          mssv: '20000001',
          name: 'Test Student',
          dob: 43831, // Excel serial date number
          gender: 'Nam',
          faculty: 'Test Faculty',
          course: '2020',
          program: 'Test Program',
          address: 'Test Address',
          email: 'test@example.com',
          phone: '0123456789',
          status: 'Active',
        },
        {
          mssv: '20000002',
          name: 'Invalid Student',
          dob: 'invalid-date', // This will cause an error during conversion
          gender: 'Nam',
          faculty: 'Test Faculty',
          course: '2020',
          program: 'Test Program',
          address: 'Test Address',
          email: 'test2@example.com',
          phone: '0123456789',
          status: 'Active',
        },
      ];
      const worksheet = xlsx.utils.json_to_sheet(sampleData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const fakeFile = {
        filename: 'students.xlsx',
        buffer,
      } as Express.Multer.File;

      // Use the private methods via a cast to compute expected values.
      const convertExcel = (
        service as any
      ).convertExcelSerialDateToLocaleDateString.bind(service);
      const formatPhone = (service as any).formatPhone.bind(service);

      const expectedStudent: Student = {
        mssv: '20000001',
        name: 'Test Student',
        dob: convertExcel(sampleData[0].dob), // convert the serial date
        gender: 'Nam',
        faculty: 'Test Faculty',
        course: '2020',
        program: 'Test Program',
        address: 'Test Address',
        email: 'test@example.com',
        phone: formatPhone(sampleData[0].phone),
        status: 'Active',
      };

      // Stub prisma.student.create for each row.
      (prismaService.student.create as jest.Mock) = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(expectedStudent))
        .mockImplementationOnce(() => {
          throw new Error('Invalid date format');
        });

      const result = await service.importExcel(fakeFile);
      expect(result).toEqual([expectedStudent]);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error importing row'),
      );
    });
  });

  describe('generateCSVData', () => {
    it('should generate a CSV stream with student data', async () => {
      const sampleStudents: Student[] = [
        {
          mssv: '20000001',
          name: 'Test Student',
          dob: '2000-01-15',
          gender: 'Nam',
          faculty: 'Test Faculty',
          course: '2020',
          program: 'Test Program',
          address: 'Test Address',
          email: 'test@example.com',
          phone: '0123456789',
          status: 'Active',
        },
      ];
      (prismaService.student.findMany as jest.Mock).mockResolvedValue(
        sampleStudents,
      );
      const fakeCsvStream = {
        write: jest.fn(),
        end: jest.fn(),
        pipe: jest.fn(),
      };
      const csvFormatSpy = jest
        .spyOn(csv, 'format')
        .mockReturnValue(fakeCsvStream as any);
      const result = await service.generateCSVData();
      expect(prismaService.student.findMany).toHaveBeenCalled();
      expect(csvFormatSpy).toHaveBeenCalledWith({ headers: true });
      sampleStudents.forEach((student) => {
        expect(fakeCsvStream.write).toHaveBeenCalledWith(student);
      });
      expect(fakeCsvStream.end).toHaveBeenCalled();
      expect(result).toBe(fakeCsvStream);
      csvFormatSpy.mockRestore();
    });
  });

  describe('generateExcelBuffer', () => {
    it('should generate an Excel buffer with student data', async () => {
      const sampleStudents: Student[] = [
        {
          mssv: '20000001',
          name: 'Test Student',
          dob: '2000-01-15',
          gender: 'Nam',
          faculty: 'Test Faculty',
          course: '2020',
          program: 'Test Program',
          address: 'Test Address',
          email: 'test@example.com',
          phone: '0123456789',
          status: 'Active',
        },
      ];
      (prismaService.student.findMany as jest.Mock).mockResolvedValue(
        sampleStudents,
      );
      const worksheetSpy = jest.spyOn(xlsx.utils, 'json_to_sheet');
      const bookNewSpy = jest.spyOn(xlsx.utils, 'book_new');
      const bookAppendSheetSpy = jest.spyOn(xlsx.utils, 'book_append_sheet');
      const fakeBuffer = Buffer.from('fake excel buffer');
      const xlsxWriteSpy = jest
        .spyOn(xlsx, 'write')
        .mockReturnValue(fakeBuffer);
      const result = await service.generateExcelBuffer();
      expect(prismaService.student.findMany).toHaveBeenCalled();
      expect(worksheetSpy).toHaveBeenCalledWith(sampleStudents);
      expect(bookNewSpy).toHaveBeenCalled();
      expect(bookAppendSheetSpy).toHaveBeenCalled();
      expect(xlsxWriteSpy).toHaveBeenCalled();
      expect(result).toBe(fakeBuffer);
      worksheetSpy.mockRestore();
      bookNewSpy.mockRestore();
      bookAppendSheetSpy.mockRestore();
      xlsxWriteSpy.mockRestore();
    });
  });
});
