import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary');

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService, Logger],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe('multerOptions', () => {
    it('should have correct file size limit', () => {
      expect(UploadService.multerOptions.limits.fileSize).toBe(5 * 1024 * 1024);
    });

    it('should filter invalid file types', () => {
      const fileFilter = UploadService.multerOptions.fileFilter;
      const mockCallback = jest.fn();

      fileFilter(
        null,
        { originalname: 'test.jpg' } as Express.Multer.File,
        mockCallback,
      );
      expect(mockCallback).toHaveBeenCalledWith(null, true);

      fileFilter(
        null,
        { originalname: 'test.pdf' } as Express.Multer.File,
        mockCallback,
      );
      expect(mockCallback).toHaveBeenCalledWith(expect.any(Error), false);
    });
  });

  describe('uploadToCloudinary', () => {
    it('should upload file successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const mockCloudinaryResponse = {
        secure_url: 'https://cloudinary.com/test-image.jpg',
      };

      // Mock cloudinary.uploader.upload_stream
      const mockUploadStream = jest
        .fn()
        .mockImplementation((options, callback) => {
          callback(null, mockCloudinaryResponse);
          return {
            pipe: jest.fn(),
          };
        });

      (cloudinary.uploader as any).upload_stream = mockUploadStream;

      const result = await service.uploadToCloudinary(mockFile);
      expect(result).toBe(mockCloudinaryResponse.secure_url);
    });

    it('should handle upload error', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const mockError = new Error('Upload failed');

      // Mock cloudinary.uploader.upload_stream with error
      const mockUploadStream = jest
        .fn()
        .mockImplementation((options, callback) => {
          callback(mockError, null);
          return {
            pipe: jest.fn(),
          };
        });

      (cloudinary.uploader as any).upload_stream = mockUploadStream;

      await expect(service.uploadToCloudinary(mockFile)).rejects.toThrow(
        mockError,
      );
    });
  });

  describe('getFileUrl', () => {
    it('should return the provided URL', () => {
      const testUrl = 'https://cloudinary.com/test-image.jpg';
      expect(service.getFileUrl(testUrl)).toBe(testUrl);
    });
  });
});
