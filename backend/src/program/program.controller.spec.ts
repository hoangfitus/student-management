import { Test, TestingModule } from '@nestjs/testing';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';

describe('ProgramController', () => {
  let controller: ProgramController;
  const mockProgramService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramController],
      providers: [{ provide: ProgramService, useValue: mockProgramService }],
    }).compile();

    controller = module.get<ProgramController>(ProgramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new program', async () => {
      const dto = {
        name: 'New Program',
      };
      const result = {
        message: 'Program created successfully',
        program: {
          id: 1,
          name: 'New Program',
        },
      };
      mockProgramService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return a list of programs', async () => {
      const result = [
        {
          id: 1,
          name: 'Test Program',
        },
      ];
      mockProgramService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update and return the updated program', async () => {
      const dto = {
        name: 'Updated Program',
      };
      const result = {
        message: 'Program updated successfully',
        program: {
          id: 1,
          name: 'Updated Program',
        },
      };
      mockProgramService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
    });
  });
});
