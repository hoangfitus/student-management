import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { DataService } from './data.service';
import { PrismaService } from '../prisma/prisma.service';
import { Student } from '@prisma/client';
import * as csv from 'fast-csv';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';

describe('DataService', () => {
  let service: DataService;
  let prismaService: PrismaService;

  const mockStudent: Student = {
    mssv: '12345',
    name: 'Test Student',
    dob: '01/01/2000',
    gender: 'Nam',
    faculty: 'CNTT',
    course: '2020',
    program: 'Đại trà',
    address: 'Test Address',
    email: 'test@example.com',
    phone: '0123456789',
    status: 'Đang học',
    createdAt: new Date(),
  };

  const mockSchoolConfig = {
    school_name: { name: 'school_name', value: 'Test School' },
    school_address: { name: 'school_address', value: 'Test Address' },
    school_phone: { name: 'school_phone', value: '0987654321' },
    school_email: { name: 'school_email', value: 'school@test.com' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              create: jest.fn(),
              createMany: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            config: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DataService>(DataService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importCSV', () => {
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
      createdAt: new Date(),
    };

    it('should import valid rows and skip invalid rows', async () => {
      const csvContent = `mssv,name,dob,gender,faculty,course,program,address,email,phone,status
20000001,Test Student,2000-01-15,Nam,Test Faculty,2020,Test Program,Test Address,test@example.com,0123456789,Active
20000002,Invalid Student,invalid-date,Nam,Test Faculty,2020,Test Program,Test Address,test2@example.com,0123456789,Active`;

      const fakeFile = {
        originalname: 'students.csv',
        buffer: Buffer.from(csvContent, 'utf-8'),
      } as Express.Multer.File;

      jest
        .spyOn(prismaService.student, 'create')
        .mockResolvedValueOnce(validStudent)
        .mockRejectedValueOnce(new Error('Invalid date format'));

      const result = await service.importCSV(fakeFile);
      expect(result).toEqual([validStudent]);
      expect(prismaService.student.create).toHaveBeenCalledTimes(2);
    });

    it('should reject if CSV stream fails', async () => {
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
    const validStudent: Student = {
      mssv: '20000001',
      name: 'Test Student',
      dob: '15/1/2000',
      gender: 'Nam',
      faculty: 'Test Faculty',
      course: '2020',
      program: 'Test Program',
      address: 'Test Address',
      email: 'test@example.com',
      phone: '0123456789',
      status: 'Active',
      createdAt: new Date(),
    };

    it('should import valid rows and skip invalid rows', async () => {
      const sampleData = [
        {
          mssv: '20000001',
          name: 'Test Student',
          dob: 43831,
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

      const worksheet = xlsx.utils.json_to_sheet(sampleData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const fakeFile = {
        filename: 'students.xlsx',
        buffer,
      } as Express.Multer.File;

      jest
        .spyOn(prismaService.student, 'create')
        .mockResolvedValueOnce(validStudent);

      const result = await service.importExcel(fakeFile);
      expect(result).toEqual([validStudent]);
      expect(prismaService.student.create).toHaveBeenCalledTimes(1);
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
          createdAt: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.student, 'findMany')
        .mockResolvedValue(sampleStudents);

      const fakeCsvStream = {
        write: jest.fn(),
        end: jest.fn(),
        pipe: jest.fn(),
      };

      jest.spyOn(csv, 'format').mockReturnValue(fakeCsvStream as any);

      const result = await service.generateCSVData();
      expect(result).toBe(fakeCsvStream);
      expect(prismaService.student.findMany).toHaveBeenCalled();
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
          createdAt: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.student, 'findMany')
        .mockResolvedValue(sampleStudents);

      const result = await service.generateExcelBuffer();
      expect(result).toBeInstanceOf(Buffer);
      expect(prismaService.student.findMany).toHaveBeenCalled();
    });
  });

  describe('generateCertificate', () => {
    beforeEach(() => {
      jest
        .spyOn(prismaService.student, 'findUnique')
        .mockResolvedValue(mockStudent);

      jest
        .spyOn(prismaService.config, 'findUnique')
        .mockImplementation(({ where: { name } }) => {
          return Promise.resolve(mockSchoolConfig[name]) as any;
        });
    });

    it('should generate certificate with correct data', async () => {
      const reason = 'Xác nhận đang học để vay vốn ngân hàng';
      const result = await service.generateCertificate('12345', reason);

      expect(result).toMatchObject({
        school: {
          name: mockSchoolConfig.school_name.value,
          address: mockSchoolConfig.school_address.value,
          phone: mockSchoolConfig.school_phone.value,
          email: mockSchoolConfig.school_email.value,
        },
        from: expect.any(Date),
        to: expect.any(Date),
        content: expect.stringContaining(mockStudent.name),
      });

      // Kiểm tra thời hạn hiệu lực cho vay vốn (6 tháng)
      const daysDiff = Math.round(
        (result.to.getTime() - result.from.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(daysDiff).toBe(180);
    });

    it('should throw error if student not found', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null);

      await expect(
        service.generateCertificate('12345', 'test reason'),
      ).rejects.toThrow('Student not found');
    });

    it('should throw error if school config missing', async () => {
      jest.spyOn(prismaService.config, 'findUnique').mockResolvedValue(null);

      await expect(
        service.generateCertificate('12345', 'test reason'),
      ).rejects.toThrow('School information not found');
    });

    it('should throw error if reason is missing', async () => {
      await expect(service.generateCertificate('12345', '')).rejects.toThrow(
        'Reason is required',
      );
    });
  });
});
