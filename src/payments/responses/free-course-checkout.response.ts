import { ApiProperty } from '@nestjs/swagger';

interface FreeCourseCheckout {
  success: boolean;
  courseId: string;
}

export class FreeCourseCheckoutResponse {
  constructor(freeCourseCheckout: FreeCourseCheckout) {
    this.success = freeCourseCheckout.success;
    this.courseId = freeCourseCheckout.courseId;
  }

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  courseId: string;
}
