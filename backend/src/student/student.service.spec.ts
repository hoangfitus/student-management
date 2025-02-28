import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { PrismaService } from '../prisma/prisma.service';
import { Student } from '@prisma/client';
import { Logger } from '@nestjs/common';

describe('StudentService', () => {
  let service: StudentService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentService, PrismaService, Logger],
    }).compile();

    service = module.get<StudentService>(StudentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return total and students array', async () => {
      jest.spyOn(prismaService.student, 'count').mockResolvedValueOnce(2);
      const fakeStudents: Student[] = [
        {
          mssv: '20000001',
          name: 'Test Student 1',
          dob: '2000-01-15',
          gender: 'Nam',
          faculty: 'Khoa Luật',
          course: '2020',
          program: 'Đại trà',
          address: 'Address 1',
          email: 'test1@example.com',
          phone: '0123456789',
          status: 'Đang học',
        },
        {
          mssv: '20000002',
          name: 'Test Student 2',
          dob: '2000-02-20',
          gender: 'Nữ',
          faculty: 'Khoa Tiếng Anh thương mại',
          course: '2020',
          program: 'Chất lượng cao',
          address: 'Address 2',
          email: 'test2@example.com',
          phone: '0987654321',
          status: 'Đang học',
        },
      ];
      jest
        .spyOn(prismaService.student, 'findMany')
        .mockResolvedValueOnce(fakeStudents);

      const result = await service.findAll('', '', 0, 5);
      expect(result.total).toBe(2);
      expect(result.students).toEqual(fakeStudents);
    });
  });

  describe('create', () => {
    it('should create a student and return it', async () => {
      const createDto = {
        mssv: '20000003',
        name: 'New Student',
        dob: '2000-03-15T00:00:00.000Z', // ISO string
        gender: 'Nam',
        faculty: 'Khoa Luật',
        course: '2020',
        program: 'Đại trà',
        address: 'New Address',
        email: 'new@example.com',
        phone: '0123456799',
        status: 'Đang học',
      };
      const createdStudent: Student = {
        ...createDto,
      };
      jest
        .spyOn(prismaService.student, 'create')
        .mockResolvedValueOnce(createdStudent);

      const result = await service.create(createDto);
      expect(result.message).toBe('Student created successfully');
      expect(result.student).toEqual(createdStudent);
    });
  });

  describe('update', () => {
    it('should update a student and return the updated student', async () => {
      const mssv = '20000001';
      const updateDto = {
        name: 'Updated Name',
        dob: '2000-01-15T00:00:00.000Z',
        gender: 'Nam',
        faculty: 'Updated Faculty',
        course: '2020',
        program: 'Updated Program',
        address: 'Updated Address',
        email: 'updated@example.com',
        phone: '0123456799',
        status: 'Đang học',
      };
      // Simulate that student exists
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValueOnce({
        mssv,
        name: 'Old Name',
        dob: '2000-01-15',
        gender: 'Nam',
        faculty: 'Old Faculty',
        course: '2020',
        program: 'Old Program',
        address: 'Old Address',
        email: 'old@example.com',
        phone: '0123456789',
        status: 'Đang học',
      });
      const updatedStudent: Student = {
        mssv,
        ...updateDto,
      };
      jest
        .spyOn(prismaService.student, 'update')
        .mockResolvedValueOnce(updatedStudent);

      const result = await service.update(+mssv, updateDto);
      expect(result.message).toBe('Student updated successfully');
      expect(result.student).toEqual(updatedStudent);
    });
  });

  describe('remove', () => {
    it('should delete a student and return a success message', async () => {
      const mssv = '20000001';
      // Mock deletion by resolving a student record
      jest.spyOn(prismaService.student, 'delete').mockResolvedValueOnce({
        mssv,
        name: 'Deleted Student',
        dob: '2000-01-15',
        gender: 'Nam',
        faculty: 'Khoa Luật',
        course: '2020',
        program: 'Đại trà',
        address: 'Address',
        email: 'deleted@example.com',
        phone: '0123456789',
        status: 'Đang học',
      });
      const result = await service.remove(+mssv);
      expect(result.message).toBe('Student deleted successfully');
    });
  });
});
