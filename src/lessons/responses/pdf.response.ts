import { ApiProperty } from '@nestjs/swagger';

export class PdfResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  publicId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty()
  downloadUrl: string;
}
