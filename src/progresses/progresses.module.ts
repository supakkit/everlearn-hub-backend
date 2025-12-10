import { Module } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProgressesController } from './progresses.controller';
import { LessonsModule } from 'src/lessons/lessons.module';

@Module({
  imports: [PrismaModule, LessonsModule],
  providers: [ProgressesService],
  exports: [ProgressesService],
  controllers: [ProgressesController],
})
export class ProgressesModule {}
