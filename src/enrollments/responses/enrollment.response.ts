import { ApiProperty } from '@nestjs/swagger';
import { Enrollment } from '@prisma/client';

export class EnrollmentResponse {
  constructor(enrollment: Enrollment) {
    this.id = enrollment.id;
    this.paid = enrollment.paid;
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  paid: boolean;
}
