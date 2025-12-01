import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { v2 as cloudinaryType } from 'cloudinary';
import { CLOUDINARY } from './constants';
import { CloudinaryResponse } from './cloudinary-response';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof cloudinaryType) {}

  async uploadSingleFile(
    singleFile: Express.Multer.File,
    fileType: FileType,
    folder: CloudinaryFolder,
  ): Promise<CloudinaryResponse> {
    if (!singleFile) {
      throw new BadRequestException('No file provided');
    }

    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder, resource_type: fileType },
        (error, result) => {
          if (error || !result)
            return reject(new BadRequestException('Upload failed'));
          resolve(result);
        },
      );

      upload.end(singleFile.buffer);
    });
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    fileType: FileType,
    folder: CloudinaryFolder,
  ): Promise<CloudinaryResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map(async (file) => {
      return new Promise<CloudinaryResponse>((resolve, reject) => {
        const upload = this.cloudinary.uploader.upload_stream(
          { folder, resource_type: fileType },
          (error, result) => {
            if (error || !result)
              return reject(new BadRequestException('Upload failed'));
            resolve(result);
          },
        );

        upload.end(file.buffer);
      });
    });

    const results = await Promise.allSettled(uploadPromises);

    const successfulUploads = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);

    const failedUploads = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason as string);

    if (failedUploads.length > 0) {
      // Rollback successful uploads
      await this.cloudinary.api.delete_resources(
        successfulUploads.map((result) => result.public_id as string),
        { resource_type: fileType },
      );
      throw new BadRequestException(
        `Failed to upload: ${failedUploads.join(', ')}`,
      );
    }

    return successfulUploads;
  }

  async deleteSingleFile(fileType: FileType, publicId: string) {
    if (!publicId) return;

    try {
      await this.cloudinary.uploader.destroy(publicId, {
        resource_type: fileType,
      });
    } catch {
      throw new BadRequestException('Failed to delete file');
    }
  }

  async deleteMultipleFiles(fileType: FileType, publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) return;

    try {
      await this.cloudinary.api.delete_resources(publicIds, {
        resource_type: fileType,
      });
    } catch {
      throw new BadRequestException('Failed to delete files');
    }
  }
}
