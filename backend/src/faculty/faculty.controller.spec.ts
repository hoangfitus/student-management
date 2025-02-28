import { Test, TestingModule } from '@nestjs/testing';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';

describe('FacultyController', () => {
  let controller: FacultyController;
  const mockFacultyService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyController],
      providers: [{ provide: FacultyService, useValue: mockFacultyService }],
    }).compile();

    controller = module.get<FacultyController>(FacultyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of faculties', async () => {
      const result = [
        {
          id: 1,
          name: 'Test Faculty',
        },
      ];
      mockFacultyService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('create', () => {
    it('should create and return a new faculty', async () => {
      const dto = {
        name: 'New Faculty',
      };
      const result = {
        message: 'Faculty created successfully',
        faculty: {
          id: 2,
          name: 'New Faculty',
        },
      };
      mockFacultyService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update and return the updated faculty', async () => {
      const dto = {
        name: 'Updated Faculty',
      };
      const result = {
        message: 'Faculty updated successfully',
        faculty: {
          id: 1,
          name: 'Updated Faculty',
        },
      };
      mockFacultyService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
    });
  });
});
