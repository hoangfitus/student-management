import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { Response } from 'express';

describe('DataController', () => {
  let controller: DataController;
  const mockDataService = {
    importCSV: jest.fn(),
    importExcel: jest.fn(),
    exportCSV: jest.fn(),
    exportExcel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [{ provide: DataService, useValue: mockDataService }],
    }).compile();

    controller = module.get<DataController>(DataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('import endpoints', () => {
    it('should call importExcel when file is Excel', async () => {
      const file = {
        path: 'dummy.xlsx',
        originalname: 'dummy.xlsx',
      } as Express.Multer.File;
      await controller.importExcel(file, '');
      expect(mockDataService.importExcel).toHaveBeenCalledWith(file.path);
    });

    it('should call importCSV when file is CSV', async () => {
      const file = {
        path: 'dummy.csv',
        originalname: 'dummy.csv',
      } as Express.Multer.File;
      await controller.importCSV(file);
      expect(mockDataService.importCSV).toHaveBeenCalledWith(file.path);
    });
  });

  describe('export endpoints', () => {
    it('should call exportCSV and trigger res.download for CSV', async () => {
      const res = { download: jest.fn() } as unknown as Response;
      await controller.exportCSV(res);
      expect(mockDataService.exportCSV).toHaveBeenCalled();
      expect(res.download).toHaveBeenCalled();
    });

    it('should call exportExcel and trigger res.download for Excel', async () => {
      const res = { download: jest.fn() } as unknown as Response;
      await controller.exportExcel(res);
      expect(mockDataService.exportExcel).toHaveBeenCalled();
      expect(res.download).toHaveBeenCalled();
    });
  });
});
