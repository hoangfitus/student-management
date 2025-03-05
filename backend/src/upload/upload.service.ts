import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private readonly logger: Logger) {
    // Cấu hình Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  static multerOptions = {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
      }
      cb(null, true);
    },
  };

  async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'school-management',
        },
        (error, result) => {
          if (error) {
            this.logger.error('Upload to Cloudinary failed:', error);
            return reject(error);
          }
          this.logger.log(`Uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );

      // Chuyển buffer thành stream và pipe vào upload stream
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  getFileUrl(url: string): string {
    this.logger.log(`File URL: ${url}`);
    return url;
  }
}
