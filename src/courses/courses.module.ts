import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AdminCoursesController } from './admin-courses.controller';
import { LessonsModule } from 'src/lessons/lessons.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, LessonsModule],
  controllers: [CoursesController, AdminCoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
