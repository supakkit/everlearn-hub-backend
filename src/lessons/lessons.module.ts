import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfsModule } from 'src/pdfs/pdfs.module';
import { AdminLessonsController } from './admin-lessons.controller';

@Module({
  imports: [PrismaModule, PdfsModule],
  controllers: [LessonsController, AdminLessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
