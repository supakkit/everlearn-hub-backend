import { ApiProperty } from '@nestjs/swagger';

export class PdfResponse {
  @ApiProperty()
  publicId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  previewUrl: string;

  @ApiProperty()
  downloadUrl: string;
}
