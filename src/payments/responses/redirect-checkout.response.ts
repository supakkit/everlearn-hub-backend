import { ApiProperty } from '@nestjs/swagger';

export class RedirectCheckoutResponse {
  constructor(payment: { url: string }) {
    this.url = payment.url;
  }

  @ApiProperty()
  url: string;
}
