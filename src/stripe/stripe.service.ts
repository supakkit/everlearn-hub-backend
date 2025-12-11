import {
  HttpException,
  Inject,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { STRIPE } from './constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private readonly STRIPE_WEBHOOK_SECRET: string;

  constructor(
    @Inject(STRIPE) private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.STRIPE_WEBHOOK_SECRET =
      this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
  }

  async handleWebhook(req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.rawBody;

    if (!rawBody) throw new HttpException('No raw body', 400);

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error('Invalid signature:', err);
      throw new HttpException('Invalid signature', 400);
    }

    try {
      // Deduplicate webhook event
      const exists = await this.prisma.stripeEvent.findFirst({
        where: { stripeEventId: event.id },
      });

      if (exists) return { received: true };

      await this.prisma.stripeEvent.create({
        data: { stripeEventId: event.id, processed: false },
      });

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        await this.handleCheckoutCompleted(session);
      }

      await this.prisma.stripeEvent.update({
        where: { stripeEventId: event.id },
        data: { processed: true },
      });
      return { received: true };
    } catch (err) {
      console.error('WEBHOOK PROCESSING ERROR:', err);
      throw new HttpException('Webhook processing failed', 500);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    if (!userId || !courseId)
      throw new Error('Missing metadata userId or courseId');

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    // 1. Store payment record
    await this.prisma.payment.create({
      data: {
        userId,
        amount: session.amount_total,
        currency: session.currency,
        stripePaymentIntentId: paymentIntentId,
        status: 'succeeded',
      },
    });

    // 2. Update Enrollment
    await this.prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { paid: true, paidAt: new Date() },
      create: {
        userId,
        courseId,
        paid: true,
        paidAt: new Date(),
      },
    });
  }
}
