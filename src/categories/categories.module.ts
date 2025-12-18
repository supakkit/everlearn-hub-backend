import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoriesController } from './categories.controller';
import { AdminCategoriesController } from './admin-categories.controller';

@Module({
  imports: [PrismaModule],
  providers: [CategoriesService],
  exports: [CategoriesService],
  controllers: [CategoriesController, AdminCategoriesController],
})
export class CategoriesModule {}
