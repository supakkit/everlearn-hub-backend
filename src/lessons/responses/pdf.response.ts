import { ApiProperty } from '@nestjs/swagger';

export class PdfResponse {
  @ApiProperty()
  publicId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  downloadUrl: string;
}
