import { FileType } from '../enums/cloudinary-filetype.enum';
import * as dotenv from 'dotenv';

dotenv.config();

export const getCloudinaryUrl = (resourceType: FileType, publicId: string) => {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${publicId}`;
};
