import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';

export class CategoryNamesResponse {
  constructor(category: Category) {
    this.name = category.name;
    this.slug = category.slug;
    this.icon = category.icon;
  }

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  icon: string;
}
