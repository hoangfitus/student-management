import { Test, TestingModule } from '@nestjs/testing';
import { StatusService } from './status.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

describe('StatusService', () => {
  let service: StatusService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusService, PrismaService, Logger],
    }).compile();

    service = module.get<StatusService>(StatusService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of statuses', async () => {
      const result = [{ id: 1, name: 'status1' }];
      jest
        .spyOn(prismaService.studentStatus, 'findMany')
        .mockImplementation(() => result as any);
      expect(await service.findAll()).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a status', async () => {
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
      jest
        .spyOn(prismaService.studentStatus, 'create')
        .mockResolvedValue(result.status);

      expect(await service.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a status', async () => {
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
      jest
        .spyOn(prismaService.studentStatus, 'update')
        .mockResolvedValue(result.status);

      expect(await service.update(1, dto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a status', async () => {
      const result = { message: 'Status deleted successfully' };
      jest
        .spyOn(prismaService.studentStatus, 'delete')
        .mockResolvedValue(result as any);

      expect(await service.remove(1)).toEqual(result);
    });
  });
});
