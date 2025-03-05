import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { PrismaService } from '../prisma/prisma.service';
import { Student } from '@prisma/client';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';

describe('StudentService', () => {
  let service: StudentService;
  let prismaService: PrismaService;

  const mockStudent: Student = {
    mssv: '20000001',
    name: 'Test Student',
    dob: '2000-01-15',
    gender: 'Nam',
    faculty: 'Khoa Luật',
    course: '2020',
    program: 'Đại trà',
    address: 'Test Address',
    email: 'test@example.com',
    phone: '0123456789',
    status: 'Đang học',
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        Logger,
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const mockStudents = [mockStudent, { ...mockStudent, mssv: '20000002' }];

    it('should return total and students array', async () => {
      const mockCount = jest.fn().mockResolvedValue(2);
      const mockFindMany = jest.fn().mockResolvedValue(mockStudents);

      prismaService.student.count = mockCount;
      prismaService.student.findMany = mockFindMany;

      const result = await service.findAll('', '', 0, 5);

      expect(result.total).toBe(2);
      expect(result.students).toEqual(mockStudents);
      expect(mockCount).toHaveBeenCalled();
      expect(mockFindMany).toHaveBeenCalledWith({
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
      const createDto = {
        ...mockStudent,
        createdAt: undefined,
      };
      prismaService.student.create = jest.fn().mockResolvedValue(mockStudent);

      const result = await service.create(createDto);

      expect(result.message).toBe('Student created successfully');
      expect(result.student).toEqual(mockStudent);
      expect(prismaService.student.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw BadRequestException when student already exists', async () => {
      const error = { code: 'P2002', meta: { target: ['mssv'] } };
      prismaService.student.create = jest.fn().mockRejectedValue(error);

      await expect(service.create(mockStudent)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Name',
      status: 'Đã tốt nghiệp',
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

      const result = await service.update(20000001, updateDto);

      expect(result.message).toBe('Student updated successfully');
      expect(result.student).toEqual(updatedStudent);
      expect(prismaService.student.update).toHaveBeenCalledWith({
        where: { mssv: '20000001' },
        data: expect.objectContaining(updateDto),
      });
    });

    it('should throw NotFoundException when student does not exist', async () => {
      prismaService.student.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.update(20000001, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a student within allowed time', async () => {
      const student = { ...mockStudent, createdAt: new Date() };
      prismaService.student.findUnique = jest.fn().mockResolvedValue(student);
      prismaService.student.delete = jest.fn().mockResolvedValue(student);

      const result = await service.remove(20000001);

      expect(result.message).toBe('Student deleted successfully');
      expect(prismaService.student.delete).toHaveBeenCalledWith({
        where: { mssv: '20000001' },
      });
    });

    it('should throw NotFoundException when student does not exist', async () => {
      prismaService.student.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.remove(20000001)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when deletion time exceeds limit', async () => {
      const pastDate = new Date(Date.now() - 31 * 60 * 1000);
      const student = { ...mockStudent, createdAt: pastDate };
      prismaService.student.findUnique = jest.fn().mockResolvedValue(student);

      await expect(service.remove(20000001)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
