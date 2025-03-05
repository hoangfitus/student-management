import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

describe('ConfigService', () => {
  let service: ConfigService;
  let prismaService: PrismaService;

  // Mock PrismaService
  const mockPrismaService = {
    config: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        Logger,
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a config', async () => {
      const createDto = { name: 'test', value: 'test' };
      const expectedResult = { id: 1, ...createDto };

      mockPrismaService.config.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(prismaService.config.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should find all configs', async () => {
      const expectedConfigs = [
        { id: 1, name: 'test1', value: 'value1' },
        { id: 2, name: 'test2', value: 'value2' },
      ];

      mockPrismaService.config.findMany.mockResolvedValue(expectedConfigs);

      const result = await service.findAll();

      expect(prismaService.config.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedConfigs);
    });
  });

  describe('update', () => {
    it('should update a config', async () => {
      const id = 1;
      const updateDto = { name: 'updated', value: 'updated' };
      const expectedResult = { id, ...updateDto };

      mockPrismaService.config.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateDto);

      expect(prismaService.config.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByName', () => {
    it('should find a config by name', async () => {
      const name = 'test';
      const expectedResult = { id: 1, name, value: 'value' };

      mockPrismaService.config.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findByName(name);

      expect(prismaService.config.findUnique).toHaveBeenCalledWith({
        where: { name },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
