import { Test, TestingModule } from '@nestjs/testing';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

describe('ConfigController', () => {
  let controller: ConfigController;
  let configService: ConfigService;

  // Mock ConfigService
  const mockConfigService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    findByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ConfigController>(ConfigController);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a config', async () => {
      const createDto = { name: 'test', value: 'test' };
      const expectedResult = { id: 1, ...createDto };

      mockConfigService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(configService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should find all configs', async () => {
      const expectedConfigs = [
        { id: 1, name: 'test1', value: 'value1' },
        { id: 2, name: 'test2', value: 'value2' },
      ];

      mockConfigService.findAll.mockResolvedValue(expectedConfigs);

      const result = await controller.findAll();

      expect(configService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedConfigs);
    });
  });

  describe('update', () => {
    it('should update a config', async () => {
      const id = '1';
      const updateDto = { name: 'updated', value: 'updated' };
      const expectedResult = { id: 1, ...updateDto };

      mockConfigService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(configService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByName', () => {
    it('should find a config by name', async () => {
      const name = 'test';
      const expectedResult = { id: 1, name, value: 'value' };

      mockConfigService.findByName.mockResolvedValue(expectedResult);

      const result = await controller.findByName(name);

      expect(configService.findByName).toHaveBeenCalledWith(name);
      expect(result).toEqual(expectedResult);
    });
  });
});
