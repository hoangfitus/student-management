import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { Student } from '@prisma/client';

describe('DataController', () => {
  let controller: DataController;
  let service: DataService;

  const mockResponse = (): Response =>
    ({
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }) as unknown as Response;

  const mockCertificateData = {
    school: {
      name: 'Test School',
      address: 'Test School Address',
      phone: '0987654321',
      email: 'school@example.com',
    },
    from: new Date(),
    to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    content: '### Certificate Content',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [
        {
          provide: DataService,
          useValue: {
            importCSV: jest.fn(),
            importExcel: jest.fn(),
            generateCSVData: jest.fn(),
            generateExcelBuffer: jest.fn(),
            generateCertificate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DataController>(DataController);
    service = module.get<DataService>(DataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('import', () => {
    it('should call dataService.importCSV when type is csv', async () => {
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      const mockResult = [{ id: 1 }];
      jest.spyOn(service, 'importCSV').mockResolvedValue(mockResult as any);

      const result = await controller.import(file, 'csv', '');

      expect(service.importCSV).toHaveBeenCalledWith(file);
      expect(result).toBe(mockResult);
    });

    it('should call dataService.importExcel when type is excel', async () => {
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      const mockResult = [{ id: 1 }];
      jest.spyOn(service, 'importExcel').mockResolvedValue(mockResult as any);

      const result = await controller.import(file, 'excel', 'false');

      expect(service.importExcel).toHaveBeenCalledWith(file);
      expect(result).toBe(mockResult);
    });

    it('should use sample file when sample is true', async () => {
      const mockResult = [{ id: 1 }];
      const sampleBuffer = Buffer.from('sample');
      jest.spyOn(fs, 'readFileSync').mockReturnValue(sampleBuffer);
      jest.spyOn(service, 'importExcel').mockResolvedValue(mockResult as any);

      const file = {} as Express.Multer.File;
      const result = await controller.import(file, 'excel', 'true');

      expect(fs.readFileSync).toHaveBeenCalledWith(
        join(process.cwd(), 'sample', 'sample.xlsx'),
      );
      expect(service.importExcel).toHaveBeenCalledWith(
        expect.objectContaining({ buffer: sampleBuffer }),
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('export', () => {
    it('should export CSV file', async () => {
      const res = mockResponse();
      const mockCsvStream = { pipe: jest.fn() };
      jest
        .spyOn(service, 'generateCSVData')
        .mockResolvedValue(mockCsvStream as any);

      await controller.export(res, 'csv');

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=students.csv',
      );
      expect(mockCsvStream.pipe).toHaveBeenCalledWith(res);
    });

    it('should export Excel file', async () => {
      const res = mockResponse();
      const mockBuffer = Buffer.from('test');
      jest.spyOn(service, 'generateExcelBuffer').mockResolvedValue(mockBuffer);

      await controller.export(res, 'excel');

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=students.xlsx',
      );
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('exportCertificate', () => {
    beforeEach(() => {
      jest
        .spyOn(service, 'generateCertificate')
        .mockResolvedValue(mockCertificateData);
    });

    it('should export certificate as markdown', async () => {
      const res = mockResponse();
      const id = '12345';
      const reason = 'test reason';

      await controller.exportCertificate(res, id, 'md', reason);

      expect(service.generateCertificate).toHaveBeenCalledWith(id, reason);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/markdown',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=certificate.md',
      );
      expect(res.send).toHaveBeenCalledWith(mockCertificateData.content);
    });

    it('should return certificate data for PDF generation', async () => {
      const res = mockResponse();
      const id = '12345';
      const reason = 'test reason';

      await controller.exportCertificate(res, id, 'pdf', reason);

      expect(service.generateCertificate).toHaveBeenCalledWith(id, reason);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        school: mockCertificateData.school,
        from: mockCertificateData.from.toLocaleDateString('vi-VN'),
        to: mockCertificateData.to.toLocaleDateString('vi-VN'),
      });
    });
  });
});
