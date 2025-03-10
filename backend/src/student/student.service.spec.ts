import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { PrismaService } from '../prisma/prisma.service';
import { Student } from '@prisma/client';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { DateFormatService } from '../common/date-format.service';

describe('StudentService', () => {
  let service: StudentService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let dateFormatService: DateFormatService;

  const mockStudent: Student = {
    mssv: '20000001',
    name: 'Test Student',
    dob: '15-01-2000',
    gender: 'Nam',
    faculty: 'Khoa Luật',
    course: '2020',
    program: 'Đại trà',
    address: 'Test Address',
    email: 'test@example.com',
    phone: '0123456789',
    status: 'Đang theo học',
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
  };

  const mockConfigService = {
    findByName: jest.fn((name: string) => {
      if (name === 'update_student_status_with_rule') {
        return Promise.resolve({ value: 'true' });
      }
      if (name === 'delete_student_in_time') {
        return Promise.resolve({ value: 'true' });
      }
      return Promise.resolve({ value: 'false' });
    }),
  };

  const mockDateFormatService = {
    // For simplicity in tests, we assume formatDate returns the same value
    formatDate: jest.fn((date: any) => date),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const mockPrismaService = {
    student: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: Logger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DateFormatService, useValue: mockDateFormatService },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    dateFormatService = module.get<DateFormatService>(DateFormatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const student = { ...mockStudent, createdAt: new Date() };
    const mockStudents = [student, { ...student, mssv: '20000002' }];

    it('should return total and students array without createdAt', async () => {
      prismaService.student.count = jest.fn().mockResolvedValue(2);
      prismaService.student.findMany = jest
        .fn()
        .mockResolvedValue(mockStudents);

      const result = await service.findAll('', '', 0, 5);

      // Ensure that the createdAt property is stripped out from each student
      expect(result.total).toBe(2);
      expect(result.students).toEqual(
        mockStudents.map(({ createdAt, ...s }) => s),
      );
      expect(prismaService.student.count).toHaveBeenCalled();
      expect(prismaService.student.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { mssv: { contains: '', mode: 'insensitive' } },
            { name: { contains: '', mode: 'insensitive' } },
          ],
        },
        take: 5,
        skip: 0,
        orderBy: { mssv: 'asc' },
      });
    });

    it('should apply faculty filter when provided', async () => {
      const faculty = 'Khoa Luật';
      prismaService.student.count = jest.fn().mockResolvedValue(1);
      prismaService.student.findMany = jest
        .fn()
        .mockResolvedValue([mockStudent]);

      await service.findAll('', faculty, 0, 5);

      expect(prismaService.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            faculty: { contains: faculty, mode: 'insensitive' },
          }),
        }),
      );
    });
  });

  describe('create', () => {
    it('should create and return a student', async () => {
      const createDto = { ...mockStudent };
      prismaService.student.create = jest.fn().mockResolvedValue(mockStudent);

      const result = await service.create(createDto);

      // Verify that the DOB is formatted using the DateFormatService
      expect(dateFormatService.formatDate).toHaveBeenCalledWith(createDto.dob);
      expect(result.message).toBe('Student created successfully');
      expect(result.student).toEqual(mockStudent);
      expect(prismaService.student.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          dob: createDto.dob, // since our mock formatDate returns the same value
        },
      });
    });

    it('should throw BadRequestException when student already exists', async () => {
      const error = {
        code: 'P2002',
        meta: { target: ['mssv'] },
        message: 'Duplicate',
      };
      prismaService.student.create = jest.fn().mockRejectedValue(error);

      await expect(service.create(mockStudent)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Name',
      status: 'Đã hoàn thành chương trình, chờ xét tốt nghiệp',
      dob: '16-01-2000',
    };

    it('should update and return a student', async () => {
      const existingStudent = { ...mockStudent };
      const updatedStudent = { ...mockStudent, ...updateDto };

      prismaService.student.findUnique = jest
        .fn()
        .mockResolvedValue(existingStudent);
      prismaService.student.update = jest
        .fn()
        .mockResolvedValue(updatedStudent);

      const result = await service.update(Number(mockStudent.mssv), updateDto);

      expect(dateFormatService.formatDate).toHaveBeenCalledWith(updateDto.dob);
      expect(result.message).toBe('Student updated successfully');
      expect(result.student).toEqual(updatedStudent);
      expect(prismaService.student.update).toHaveBeenCalledWith({
        where: { mssv: mockStudent.mssv },
        data: expect.objectContaining(updateDto),
      });
    });

    it('should throw NotFoundException when student does not exist', async () => {
      prismaService.student.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.update(Number(mockStudent.mssv), updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on invalid status transition', async () => {
      const existingStudent = { ...mockStudent, status: 'Đang học' };
      const invalidUpdateDto = {
        name: 'Updated Name',
        status: 'Some Invalid Status',
        dob: '16-01-2000',
      };

      prismaService.student.findUnique = jest
        .fn()
        .mockResolvedValue(existingStudent);

      await expect(
        service.update(Number(mockStudent.mssv), invalidUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a student within allowed time', async () => {
      const student = { ...mockStudent, createdAt: new Date() };
      prismaService.student.findUnique = jest.fn().mockResolvedValue(student);
      prismaService.student.delete = jest.fn().mockResolvedValue(student);

      const result = await service.remove(Number(mockStudent.mssv));

      expect(result.message).toBe('Student deleted successfully');
      expect(prismaService.student.delete).toHaveBeenCalledWith({
        where: { mssv: mockStudent.mssv },
      });
    });

    it('should throw NotFoundException when student does not exist', async () => {
      prismaService.student.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.remove(Number(mockStudent.mssv))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when deletion time exceeds limit', async () => {
      // Set a createdAt older than the DELETE_TIME_LIMIT (30 minutes)
      const pastDate = new Date(Date.now() - 31 * 60 * 1000);
      const student = { ...mockStudent, createdAt: pastDate };
      prismaService.student.findUnique = jest.fn().mockResolvedValue(student);

      await expect(service.remove(Number(mockStudent.mssv))).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
