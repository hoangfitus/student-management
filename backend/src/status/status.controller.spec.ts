import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

describe('StatusController', () => {
  let controller: StatusController;
  const mockStatusService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [{ provide: StatusService, useValue: mockStatusService }],
    }).compile();

    controller = module.get<StatusController>(StatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new status', async () => {
      const dto = {
        name: 'New Status',
      };
      const result = {
        message: 'Status created successfully',
        status: {
          id: 2,
          name: 'New Status',
        },
      };
      mockStatusService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return a list of statuses', async () => {
      const result = [
        {
          id: 1,
          name: 'Test Status',
        },
      ];
      mockStatusService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update and return the updated status', async () => {
      const dto = {
        name: 'Updated Status',
      };
      const result = {
        message: 'Status updated successfully',
        status: {
          id: 1,
          name: 'Updated Status',
        },
      };
      mockStatusService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a status', async () => {
      const result = { message: 'Status deleted successfully' };
      mockStatusService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
    });
  });
});
