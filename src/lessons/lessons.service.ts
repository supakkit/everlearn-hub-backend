import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfsService } from 'src/pdfs/pdfs.service';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { UpdatePdfDto } from './dto/update-pdf.dto';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private pdfsService: PdfsService,
  ) {}

  async create(
    createLessonDto: CreateLessonDto,
    pdfFiles?: Express.Multer.File[],
  ) {
    const { pdfs, ...dtoData } = createLessonDto;

    const currentLastPosition = await this.prisma.lesson.findFirst({
      where: { courseId: createLessonDto.courseId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = currentLastPosition
      ? currentLastPosition.position + 1
      : 1;

    const lesson = await this.prisma.lesson.create({
      data: { ...dtoData, position: nextPosition },
    });

    if (!pdfFiles || pdfFiles.length === 0) {
      return lesson;
    }

    let metadata: CreatePdfDto[] | undefined;
    if (pdfs) metadata = JSON.parse(pdfs) as CreatePdfDto[];
    const createdPdfs = await this.pdfsService.createPdfs(
      lesson.id,
      pdfFiles,
      metadata,
    );
    const lessonWithPdfs = { ...lesson, pdfs: createdPdfs };
    return lessonWithPdfs;
  }

  findByCourseId(courseId: string) {
    return this.prisma.lesson.findMany({ where: { courseId } });
  }

  findAll() {
    return this.prisma.lesson.findMany({
      include: { pdfs: true },
    });
  }

  findOne(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
      include: { pdfs: true },
    });
  }

  findLessonPreview(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id, isPreview: true },
    });
  }

  async update(
    id: string,
    updateLessonDto: UpdateLessonDto,
    pdfFiles?: Express.Multer.File[],
  ) {
    const { pdfs, ...dtoData } = updateLessonDto;

    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: dtoData,
      include: { pdfs: true },
    });

    if (!pdfs && !pdfFiles) {
      return lesson;
    }

    let metadata: UpdatePdfDto[] | undefined;
    if (pdfs) metadata = JSON.parse(pdfs) as UpdatePdfDto[];

    const incomingPdfMetas = metadata ?? [];
    const removedPdfPublicIds = incomingPdfMetas
      .map((m) => m?.removedPdfPublicId)
      .filter((publicId) => publicId !== undefined);

    // Delete removed PDFs from Cloudinary + DB
    if (removedPdfPublicIds.length > 0) {
      await this.pdfsService.deletePdfs(removedPdfPublicIds);
    }

    // Create new PDFs
    const newPdfMetas = incomingPdfMetas.filter((m) => !m.removedPdfPublicId);

    if (pdfFiles) {
      await this.pdfsService.createPdfs(lesson.id, pdfFiles, newPdfMetas);
    }

    // Return fresh lesson with updated PDFs
    const updatedLesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { pdfs: true },
    });

    return updatedLesson ?? lesson;
  }

  async remove(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { pdfs: true },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    await this.pdfsService.deletePdfs(lesson.pdfs.map((pdf) => pdf.publicId));
    return await this.prisma.lesson.delete({ where: { id } });
  }
}
