import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryNamesResponse } from './responses/category-names.response';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOkResponse({ type: CategoryNamesResponse, isArray: true })
  async getCategoryNames() {
    const categories = await this.categoriesService.getCategoryNames();
    return categories.map((category) => new CategoryNamesResponse(category));
  }
}
