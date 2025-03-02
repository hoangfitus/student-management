import { Test, TestingModule } from '@nestjs/testing';
import { DataService } from './data.service';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as csv from 'fast-csv';
import { Student } from '@prisma/client';
import { join } from 'path';
import { Readable } from 'stream';
import * as fs from 'fs';

describe('DataService', () => {
  let service: DataService;
  let mockPrismaService: PrismaService;

  beforeEach(async () => {
    // Create a stub for PrismaService with the methods used by DataService
    mockPrismaService = {
      student: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataService,
        { provide: PrismaService, useValue: mockPrismaService },
        Logger,
      ],
    }).compile();

    service = module.get<DataService>(DataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importExcel', () => {
    it('should import students from an Excel file and return students', async () => {
      // Prepare sample data that would come from Excel
      const sampleData = [
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

      // Stub findMany to return the sample data after creation
      (mockPrismaService.student.findMany as jest.Mock).mockResolvedValue(
        sampleData,
      );

      // Generate an Excel workbook buffer from sampleData using xlsx
      const worksheet = xlsx.utils.json_to_sheet(sampleData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Create a fake file object with the buffer
      const file = {
        originalname: 'students.xlsx',
        buffer,
      } as Express.Multer.File;

      // Act
      const result = await service.importExcel(file);

      // Assert: The result should equal sampleData (as returned by findMany)
      expect(result).toEqual(sampleData);
    });
  });

  describe('importCSV', () => {
    it('should import students from a CSV file and return students', async () => {
      // Prepare sample CSV content with one row
      const csvContent = `mssv,name,dob,gender,faculty,course,program,address,email,phone,status
20000001,Test Student,2000-01-15,Nam,Test Faculty,2020,Test Program,Test Address,test@example.com,0123456789,Active`;

      // Create a fake file object with the CSV content buffer
      const file = {
        originalname: 'test.csv',
        buffer: Buffer.from(csvContent, 'utf-8'),
      } as Express.Multer.File;

      // Setup the mock for prisma.student.create so that each call returns the expected student
      const expectedStudent: Student = {
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

      // Since the CSV import creates one student per row,
      // mock create to resolve the expected student.
      (mockPrismaService.student.create as jest.Mock).mockResolvedValue(
        expectedStudent,
      );

      // Act
      const result = await service.importCSV(file);

      // Assert: With one row in CSV, expect create to be called once.
      expect(mockPrismaService.student.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual([expectedStudent]);
    });
  });

  describe('generateCSVData', () => {
    it('should generate a CSV stream with student data', async () => {
      // Sample student data
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
      (mockPrismaService.student.findMany as jest.Mock).mockResolvedValue(
        sampleStudents,
      );

      // Create a fake CSV stream with spies on write and end
      const fakeCsvStream = {
        write: jest.fn(),
        end: jest.fn(),
        pipe: jest.fn(),
      };

      // Spy on csv.format to return our fake CSV stream
      const csvFormatSpy = jest
        .spyOn(csv, 'format')
        .mockReturnValue(fakeCsvStream as any);

      // Act
      const result = await service.generateCSVData();

      // Assert
      expect(mockPrismaService.student.findMany).toHaveBeenCalled();
      expect(csvFormatSpy).toHaveBeenCalledWith({ headers: true });
      sampleStudents.forEach((student) => {
        expect(fakeCsvStream.write).toHaveBeenCalledWith(student);
      });
      expect(fakeCsvStream.end).toHaveBeenCalled();
      expect(result).toBe(fakeCsvStream);

      // Clean up spies
      csvFormatSpy.mockRestore();
    });
  });

  describe('generateExcelBuffer', () => {
    it('should generate an Excel buffer with student data', async () => {
      // Arrange: Fake student data
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
      (mockPrismaService.student.findMany as jest.Mock).mockResolvedValue(
        sampleStudents,
      );

      // Spy on xlsx.utils functions
      const jsonToSheetSpy = jest.spyOn(xlsx.utils, 'json_to_sheet');
      const bookNewSpy = jest.spyOn(xlsx.utils, 'book_new');
      const bookAppendSheetSpy = jest.spyOn(xlsx.utils, 'book_append_sheet');
      const fakeBuffer = Buffer.from('fake excel buffer');
      const xlsxWriteSpy = jest
        .spyOn(xlsx, 'write')
        .mockReturnValue(fakeBuffer);

      // Act
      const result = await service.generateExcelBuffer();

      // Assert
      expect(mockPrismaService.student.findMany).toHaveBeenCalled();
      expect(jsonToSheetSpy).toHaveBeenCalledWith(sampleStudents);
      expect(bookNewSpy).toHaveBeenCalled();
      expect(bookAppendSheetSpy).toHaveBeenCalled();
      expect(xlsxWriteSpy).toHaveBeenCalled();
      expect(result).toBe(fakeBuffer);

      // Clean up spies
      jsonToSheetSpy.mockRestore();
      bookNewSpy.mockRestore();
      bookAppendSheetSpy.mockRestore();
      xlsxWriteSpy.mockRestore();
    });
  });
});
