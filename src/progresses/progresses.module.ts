import { Module } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProgressesService],
  exports: [ProgressesService],
})
export class ProgressesModule {}
