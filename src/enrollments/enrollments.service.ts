import { Injectable } from '@nestjs/common';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, courseId: string) {
    return this.prisma.enrollment.create({ data: { userId, courseId } });
  }

  findAll() {
    return this.prisma.enrollment.findMany();
  }

  findOne(id: string) {
    return this.prisma.enrollment.findUnique({ where: { id } });
  }

  update(updateEnrollmentDto: UpdateEnrollmentDto) {
    const { id, paid } = updateEnrollmentDto;
    return this.prisma.enrollment.update({ where: { id }, data: { paid } });
  }

  remove(id: string) {
    return this.prisma.enrollment.delete({ where: { id } });
  }

  findUserEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({ where: { userId } });
  }

  countUserEnrollments(userId: string) {
    return this.prisma.enrollment.count({ where: { userId } });
  }
}
