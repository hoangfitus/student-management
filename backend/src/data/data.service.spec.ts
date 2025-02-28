import { Test, TestingModule } from '@nestjs/testing';
import { DataService } from './data.service';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { Student } from '@prisma/client';

// Mock the xlsx module
jest.mock('xlsx', () => ({
  readFile: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
    write: jest.fn(() => Buffer.from('excel buffer')),
  },
}));

describe('DataService', () => {
  let service: DataService;
  const fakePrismaService = {
    student: {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataService, PrismaService, Logger],
    }).compile();

    service = new DataService(fakePrismaService, module.get<Logger>(Logger));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importExcel', () => {
    it('should import students from an Excel file', async () => {
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
      // Mock xlsx functions
      (xlsx.readFile as jest.Mock).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      });
      // Mock sheet_to_json to return our sample data
      (xlsx.utils.sheet_to_json as jest.Mock).mockReturnValue(sampleData);

      // Mock fs.readFileSync to return a dummy Buffer (content doesn't matter)
      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('dummy'));

      const result = await service.importExcel('dummyPath.xlsx');

      // Check that the Prisma createMany method was called with the transformed data
      expect(fakePrismaService.student.createMany).toHaveBeenCalled();
      // And that our importExcel method returns an empty array (from the subsequent findMany)
      expect(result).toEqual([]);
    });
  });

  describe('exportCSV', () => {
    it('should export students to a CSV file', async () => {
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
      jest
        .spyOn(fakePrismaService.student, 'findMany')
        .mockResolvedValueOnce(sampleStudents);
      const tempFilePath = 'temp.csv';
      // Spy on fs.createWriteStream to prevent actual file writes
      const writableStreamMock = {
        on: jest.fn().mockReturnThis(),
        once: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn(),
        pipe: jest.fn(),
        emit: jest.fn(),
      };
      // Spy on fs.createWriteStream to return our dummy writable stream
      jest
        .spyOn(fs, 'createWriteStream')
        .mockReturnValue(writableStreamMock as any);

      await service.exportCSV(tempFilePath);

      expect(fakePrismaService.student.findMany).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalledWith(tempFilePath);
      // Optionally, you can check that writableStreamMock.write was called at least once
      expect(writableStreamMock.write).toHaveBeenCalled();
    });
  });
});
