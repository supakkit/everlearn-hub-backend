import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { v2 as cloudinaryType } from 'cloudinary';
import { CLOUDINARY } from './constants';
import { CloudinaryResponse } from './cloudinary-response';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof cloudinaryType) {}

  async uploadSingleImage(
    singleImageFile: Express.Multer.File,
    folder: CloudinaryFolder,
  ): Promise<CloudinaryResponse> {
    if (!singleImageFile) {
      throw new BadRequestException('No image file provided');
    }

    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result)
            return reject(new BadRequestException('Upload failed'));
          resolve(result);
        },
      );

      upload.end(singleImageFile.buffer);
    });
  }

  async deleteImage(publicId: string) {
    if (!publicId) return;

    try {
      await this.cloudinary.uploader.destroy(publicId);
    } catch {
      throw new BadRequestException('Delete failed');
    }
  }
}
