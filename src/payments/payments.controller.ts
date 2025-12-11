import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { RedirectCheckoutResponse } from './responses/redirect-checkout.response';
import { CheckoutSessionResponse } from './responses/checkout-session.response';
import { FreeCourseCheckoutResponse } from './responses/free-course-checkout.response';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiCreatedResponse({ type: RedirectCheckoutResponse })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: AuthRequest,
  ) {
    const checkoutSession = await this.paymentsService.createCheckoutSession(
      req.user.sub,
      createPaymentDto,
    );
    return new RedirectCheckoutResponse(checkoutSession);
  }

  @Post('free-enroll')
  @ApiCreatedResponse({ type: FreeCourseCheckoutResponse })
  async enrollFreeCourse(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: AuthRequest,
  ) {
    const checkoutSession = await this.paymentsService.enrollFreeCourse(
      req.user.sub,
      createPaymentDto,
    );
    return new FreeCourseCheckoutResponse(checkoutSession);
  }

  @Get('checkout-session/:sessionId')
  @ApiOkResponse({ type: CheckoutSessionResponse })
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    const checkoutSession =
      await this.paymentsService.getCheckoutSession(sessionId);
    return new CheckoutSessionResponse(checkoutSession);
  }
}
