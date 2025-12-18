import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryWithCourseCountResponse } from './responses/category-with-course-count.response';

@Controller('admin/categories')
@ApiTags('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth()
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiCreatedResponse({ type: CategoryWithCourseCountResponse })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const category =
      await this.categoriesService.createCategory(createCategoryDto);
    return new CategoryWithCourseCountResponse(category);
  }

  @Get()
  @ApiOkResponse({ type: CategoryWithCourseCountResponse, isArray: true })
  async getCategoriesWithCourseCount() {
    const categories =
      await this.categoriesService.getCategoriesWithCourseCount();
    return categories.map(
      (category) => new CategoryWithCourseCountResponse(category),
    );
  }

  @Patch(':id')
  @ApiOkResponse({ type: CategoryWithCourseCountResponse })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.updateCategory(
      id,
      updateCategoryDto,
    );
    return new CategoryWithCourseCountResponse(category);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CategoryWithCourseCountResponse })
  async removeCategory(@Param('id') id: string) {
    const category = await this.categoriesService.removeCategory(id);
    return new CategoryWithCourseCountResponse(category);
  }
}
