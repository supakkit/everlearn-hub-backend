import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfsModule } from 'src/pdfs/pdfs.module';

@Module({
  imports: [PrismaModule, PdfsModule],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
