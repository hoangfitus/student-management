import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUploadService = {
    uploadToCloudinary: jest.fn(),
    getFileUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file and return url', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test-file.jpg',
      } as Express.Multer.File;

      const cloudinaryUrl = 'https://cloudinary.com/test-file.jpg';
      mockUploadService.uploadToCloudinary.mockResolvedValue(cloudinaryUrl);
      mockUploadService.getFileUrl.mockReturnValue(cloudinaryUrl);

      const result = await controller.uploadFile(mockFile);

      expect(service.uploadToCloudinary).toHaveBeenCalledWith(mockFile);
      expect(service.getFileUrl).toHaveBeenCalledWith(cloudinaryUrl);
      expect(result).toEqual({ url: cloudinaryUrl });
    });
  });
});
