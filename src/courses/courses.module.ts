import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AdminCoursesController } from './admin-courses.controller';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [CoursesController, AdminCoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
