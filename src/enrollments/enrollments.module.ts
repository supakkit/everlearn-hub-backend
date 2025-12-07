import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProgressesModule } from 'src/progresses/progresses.module';

@Module({
  imports: [PrismaModule, ProgressesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
