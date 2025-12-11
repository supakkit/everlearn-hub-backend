import { ApiProperty } from '@nestjs/swagger';

interface CheckoutSession {
  sessionId: string;
  courseId: string;
  title: string;
  image: string;
  amountPaid: number;
}

export class CheckoutSessionResponse {
  constructor(checkoutSession: CheckoutSession) {
    this.sessionId = checkoutSession.sessionId;
    this.courseId = checkoutSession.courseId;
    this.title = checkoutSession.title;
    this.image = checkoutSession.image;
    this.amountPaid = checkoutSession.amountPaid;
  }

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  amountPaid: number;
}
