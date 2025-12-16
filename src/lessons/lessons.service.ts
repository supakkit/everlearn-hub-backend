import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfsService } from 'src/pdfs/pdfs.service';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import { Prisma } from '@prisma/client';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { RemovePdfDto } from './dto/remove-pdf.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';

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
    const { createPdfs: createPdfsRaw, ...lessonData } = createLessonDto;

    const createPdfs = createPdfsRaw
      ? (JSON.parse(createPdfsRaw) as CreatePdfDto[])
      : [];

    const currentLastPosition = await this.prisma.lesson.findFirst({
      where: { courseId: createLessonDto.courseId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = currentLastPosition
      ? currentLastPosition.position + 1
      : 1;

    const lesson = await this.prisma.lesson.create({
      data: { ...lessonData, position: nextPosition },
    });

    if (
      createPdfs.length &&
      pdfFiles &&
      pdfFiles.length === createPdfs.length
    ) {
      await this.pdfsService.createPdfs(lesson.id, createPdfs, pdfFiles);
    } else {
      return lesson;
    }

    const lessonWithPdfs = await this.prisma.lesson.findUnique({
      where: { id: lesson.id },
      include: { pdfs: true },
    });
    return lessonWithPdfs || lesson;
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
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
    pdfFiles?: Express.Multer.File[],
  ) {
    const {
      createPdfs: createPdfsRaw,
      updatePdfs: updatePdfsRaw,
      removePdfs: removePdfsRaw,
      ...lessonData
    } = updateLessonDto;

    const createPdfs = createPdfsRaw
      ? (JSON.parse(createPdfsRaw) as CreatePdfDto[])
      : [];
    const updatePdfs = updatePdfsRaw
      ? (JSON.parse(updatePdfsRaw) as UpdatePdfDto[])
      : [];
    const removePdfs = removePdfsRaw
      ? (JSON.parse(removePdfsRaw) as RemovePdfDto[])
      : [];

    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: lessonData,
      include: { pdfs: true },
    });

    if (!createPdfs.length && !updatePdfs.length && !removePdfs.length)
      return lesson;

    if (removePdfs.length) {
      const publicIds = removePdfs.map((pdf) => pdf.publicId);
      await this.pdfsService.deletePdfs(publicIds);
    }

    if (updatePdfs.length) {
      await this.pdfsService.updatePdfMetadata(updatePdfs);
    }

    if (
      createPdfs.length &&
      pdfFiles &&
      pdfFiles.length === createPdfs.length
    ) {
      await this.pdfsService.createPdfs(lessonId, createPdfs, pdfFiles);
    }

    const updateLesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { pdfs: true },
    });
    return updateLesson || lesson;
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

  async removeByCourse(courseId: string, tx: Prisma.TransactionClient) {
    const lessons = await tx.lesson.findMany({
      where: { courseId },
      include: { pdfs: true },
    });

    for (const lesson of lessons) {
      await this.pdfsService.deletePdfs(lesson.pdfs.map((pdf) => pdf.publicId));
    }

    await tx.lesson.deleteMany({
      where: { courseId },
    });
  }

  reorderLessons(reorderLessonsDto: ReorderLessonsDto) {
    return this.prisma.$transaction(
      reorderLessonsDto.items.map((item) =>
        this.prisma.lesson.update({
          where: { id: item.lessonId },
          data: { position: item.position },
        }),
      ),
    );
  }
}
