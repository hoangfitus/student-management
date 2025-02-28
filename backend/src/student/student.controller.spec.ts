import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

describe('StudentController', () => {
  let controller: StudentController;
  const mockStudentsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [{ provide: StudentService, useValue: mockStudentsService }],
    }).compile();

    controller = module.get<StudentController>(StudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of students and total count', async () => {
      const result = {
        total: 1,
        students: [
          {
            mssv: '20000001',
            name: 'Test Student',
            dob: '2000-01-01',
            gender: 'Nam',
            faculty: 'Test Faculty',
            course: '2020',
            program: 'Test Program',
            address: 'Test Address',
            email: 'test@example.com',
            phone: '0123456789',
            status: 'Đang học',
          },
        ],
      };
      mockStudentsService.findAll.mockResolvedValue(result);

      // Note: Controller's getStudents parameters are strings (from query)
      expect(await controller.findAll('', '', '0', '5')).toEqual(result);
    });
  });

  describe('create', () => {
    it('should create and return a new student', async () => {
      const dto = {
        mssv: '20000002',
        name: 'New Student',
        dob: '2000-01-15T00:00:00.000Z',
        gender: 'Nam',
        faculty: 'Test Faculty',
        course: '2020',
        program: 'Test Program',
        address: 'New Address',
        email: 'new@example.com',
        phone: '0123456789',
        status: 'Đang học',
      };
      const result = {
        message: 'Student created successfully',
        student: { ...dto, dob: new Date(dto.dob) },
      };
      mockStudentsService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update and return the updated student', async () => {
      const mssv = '20000001';
      const dto = {
        name: 'Updated Student',
        dob: '2000-01-15T00:00:00.000Z',
        gender: 'Nam',
        faculty: 'Updated Faculty',
        course: '2020',
        program: 'Updated Program',
        address: 'Updated Address',
        email: 'updated@example.com',
        phone: '0123456789',
        status: 'Đang học',
      };
      const result = {
        message: 'Student updated successfully',
        student: { mssv, ...dto, dob: new Date(dto.dob) },
      };
      mockStudentsService.update.mockResolvedValue(result);

      expect(await controller.update(mssv, dto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should return a success message on deletion', async () => {
      const mssv = '20000001';
      const result = { message: 'Student deleted successfully' };
      mockStudentsService.remove.mockResolvedValue(result);

      expect(await controller.remove(mssv)).toEqual(result);
    });
  });
});
