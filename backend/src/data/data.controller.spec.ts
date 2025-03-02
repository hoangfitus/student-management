import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { Response } from 'express';
import * as xlsx from 'xlsx';
import { join } from 'path';
import * as fs from 'fs';

describe('DataController', () => {
  let controller: DataController;
  let service: DataService;

  // Helper to create a fake response object
  const mockResponse = (): Response => {
    const res: Partial<Response> = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [
        {
          provide: DataService,
          useValue: {
            generateCSVData: jest.fn(),
            generateExcelBuffer: jest.fn(),
            importCSV: jest.fn(),
            importExcel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DataController>(DataController);
    service = module.get<DataService>(DataService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importCSV', () => {
    it('should call dataService.importCSV and return its result', async () => {
      // Arrange: Create a CSV string with headers and one row
      const studentCSV = `mssv,name,dob,gender,faculty,course,program,address,email,phone,status
20000001,Test Student,2000-01-15,Nam,Test Faculty,2020,Test Program,Test Address,test@example.com,0123456789,Active`;
      const fakeFile = {
        originalname: 'students.csv',
        buffer: Buffer.from(studentCSV),
      } as Express.Multer.File;

      // Create a fake student object that the service will return
      const fakeStudent = {
        mssv: '20000001',
        name: 'Test Student',
        dob: '2000-01-15',
        gender: 'Nam',
        faculty: 'Test Faculty',
        course: '2020',
        program: 'Test Program',
        address: 'Test Address',
        email: 'test@example.com',
        phone: '0123456789',
        status: 'Active',
      };

      // Stub the service.importCSV method to resolve with our fake student wrapped in an array
      (service.importCSV as jest.Mock).mockResolvedValue([fakeStudent]);

      // Act: Call the controller method
      const result = await controller.importCSV(fakeFile);

      // Assert: Check that service.importCSV was called with the correct file and that the result is returned.
      expect(service.importCSV).toHaveBeenCalledWith(fakeFile);
      expect(result).toEqual([fakeStudent]);
    });
  });

  describe('importExcel', () => {
    it('should call dataService.importExcel with the uploaded file when sample query is not true', async () => {
      // Arrange: Create sample data and an Excel buffer using xlsx
      const sampleData = [
        {
          mssv: '20000001',
          name: 'Test Student',
          dob: '2000-01-15',
          gender: 'Nam',
          faculty: 'Test Faculty',
          course: '2020',
          program: 'Test Program',
          address: 'Test Address',
          email: 'test@example.com',
          phone: '0123456789',
          status: 'Active',
        },
      ];
      const worksheet = xlsx.utils.json_to_sheet(sampleData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Create a fake file object
      const fakeFile = {
        originalname: 'students.xlsx',
        buffer,
      } as Express.Multer.File;

      // Stub the service.importExcel method to resolve with the sample data
      (service.importExcel as jest.Mock).mockResolvedValue(sampleData);

      // Act
      const result = await controller.importExcel(fakeFile, '');

      // Assert: Ensure the service method was called with the uploaded file
      expect(service.importExcel).toHaveBeenCalledWith(fakeFile);
      expect(result).toEqual(sampleData);
    });

    it('should load the sample file and call dataService.importExcel when sample query equals "true"', async () => {
      // Arrange: Create sample data
      const sampleData = [
        {
          mssv: '20000001',
          name: 'Test Student',
          dob: '2000-01-15',
          gender: 'Nam',
          faculty: 'Test Faculty',
          course: '2020',
          program: 'Test Program',
          address: 'Test Address',
          email: 'test@example.com',
          phone: '0123456789',
          status: 'Active',
        },
      ];

      // Stub the service.importExcel method to resolve with sampleData
      (service.importExcel as jest.Mock).mockResolvedValue(sampleData);

      // Create a fake sample buffer to simulate reading from disk
      const fakeSampleBuffer = Buffer.from('fake sample excel data');

      // Spy on fs.readFileSync to return our fake sample buffer
      const readFileSyncSpy = jest
        .spyOn(fs, 'readFileSync')
        .mockReturnValue(fakeSampleBuffer);

      // Act: Call the controller with sample query equals "true"
      const result = await controller.importExcel(
        {} as Express.Multer.File,
        'true',
      );

      // Assert: Verify that fs.readFileSync was called with the expected sample file path
      const expectedPath = join(process.cwd(), 'sample', 'sample.xlsx');
      expect(readFileSyncSpy).toHaveBeenCalledWith(expectedPath);
      // The controller should call service.importExcel with a file object containing the sample buffer
      expect(service.importExcel).toHaveBeenCalledWith({
        buffer: fakeSampleBuffer,
      } as Express.Multer.File);
      expect(result).toEqual(sampleData);

      readFileSyncSpy.mockRestore();
    });
  });

  describe('exportCSV', () => {
    it('should set headers and pipe CSV stream to response', async () => {
      // Arrange
      const res = mockResponse();
      const fakeCsvStream = { pipe: jest.fn() };
      (service.generateCSVData as jest.Mock).mockResolvedValue(fakeCsvStream);

      // Act
      await controller.exportCSV(res);

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=students.csv',
      );
      expect(fakeCsvStream.pipe).toHaveBeenCalledWith(res);
    });
  });

  describe('exportExcel', () => {
    it('should set headers and send excel buffer to response', async () => {
      // Arrange
      const res = mockResponse();
      const fakeBuffer = Buffer.from('fake excel buffer');
      (service.generateExcelBuffer as jest.Mock).mockResolvedValue(fakeBuffer);

      // Act
      await controller.exportExcel(res);

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=students.xlsx',
      );
      expect(res.send).toHaveBeenCalledWith(fakeBuffer);
    });
  });
});
