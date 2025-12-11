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
    const payment = await this.paymentsService.createCheckoutSession(
      req.user.sub,
      createPaymentDto,
    );
    return new RedirectCheckoutResponse(payment);
  }

  @Get('checkout-session/:sessionId')
  @ApiOkResponse({ type: CheckoutSessionResponse })
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    const checkoutSession =
      await this.paymentsService.getCheckoutSession(sessionId);
    return new CheckoutSessionResponse(checkoutSession);
  }
}
