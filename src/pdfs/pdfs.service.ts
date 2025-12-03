import path from 'node:path';
import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePdfDto } from '../lessons/dto/create-pdf.dto';
import { Prisma } from '@prisma/client';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';

@Injectable()
export class PdfsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createPdfs(
    lessonId: string,
    pdfFiles: Express.Multer.File[],
    metadata?: CreatePdfDto[],
  ) {
    if (!pdfFiles || pdfFiles.length === 0) {
      return;
    }

    const uploaded = await this.cloudinaryService.uploadMultipleFiles(
      pdfFiles,
      FileType.PDF,
      CloudinaryFolder.LESSON_PDFS,
    );

    const pdfsToCreate: Prisma.PdfCreateManyInput[] = pdfFiles.map(
      (file, index) => {
        const publicId = String(uploaded[index].public_id);
        const meta = metadata?.find((m) => m?.fileName === file.originalname);

        const fileName = path.parse(file.originalname).name;
        return {
          name: meta?.name || fileName,
          description: meta?.description,
          publicId,
          lessonId,
        };
      },
    );

    await this.prisma.pdf.createMany({ data: pdfsToCreate });
    return pdfsToCreate;
  }

  async deletePdfs(publicId: string[]) {
    await this.cloudinaryService.deleteMultipleFiles(FileType.PDF, publicId);
    await this.prisma.pdf.deleteMany({ where: { publicId: { in: publicId } } });
  }
}
