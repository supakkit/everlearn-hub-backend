import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';

export class CategoryResponse {
  constructor(category: Category) {
    this.id = category.id;
    this.name = category.name;
    this.slug = category.slug;
    this.icon = category.icon;
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  icon: string;
}
