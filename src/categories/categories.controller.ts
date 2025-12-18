import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryResponse } from './responses/category.response';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('categories')
@ApiTags('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOkResponse({ type: CategoryResponse, isArray: true })
  async getCategoryNames() {
    const categories = await this.categoriesService.getCategoryNames();
    return categories.map((category) => new CategoryResponse(category));
  }
}
