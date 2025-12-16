import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';
import { UpdatePdfDto } from 'src/lessons/dto/update-pdf.dto';
import { CreatePdfDto } from 'src/lessons/dto/create-pdf.dto';

@Injectable()
export class PdfsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createPdfs(
    lessonId: string,
    createDtos: CreatePdfDto[],
    pdfFiles: Express.Multer.File[],
  ) {
    if (!pdfFiles || pdfFiles.length === 0) {
      return;
    }

    for (let i = 0; i < pdfFiles.length; i++) {
      const upload = await this.cloudinaryService.uploadSingleFile(
        pdfFiles[i],
        FileType.PDF,
        CloudinaryFolder.LESSON_PDFS,
      );

      await this.prisma.pdf.create({
        data: {
          lessonId,
          name: createDtos[i].name,
          description: createDtos[i].description,
          publicId: upload.public_id as string,
        },
      });
    }
  }

  async updatePdfMetadata(dtos: UpdatePdfDto[]) {
    await Promise.all(
      dtos.map((dto) =>
        this.prisma.pdf.update({
          where: { id: dto.id },
          data: {
            name: dto.name,
            description: dto.description,
          },
        }),
      ),
    );
  }

  async deletePdfs(publicId: string[]) {
    await this.cloudinaryService.deleteMultipleFiles(FileType.PDF, publicId);
    await this.prisma.pdf.deleteMany({ where: { publicId: { in: publicId } } });
  }
}
