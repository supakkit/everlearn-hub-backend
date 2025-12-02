import { Module } from '@nestjs/common';
import { PdfsService } from './pdfs.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  providers: [PdfsService],
  exports: [PdfsService],
})
export class PdfsModule {}
