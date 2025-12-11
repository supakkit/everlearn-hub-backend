import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { STRIPE } from 'src/stripe/constants';
import Stripe from 'stripe';
import { getCloudinaryUrl } from 'src/common/utils/getCloudinaryUrl';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';

@Injectable()
export class PaymentsService {
  private readonly FRONTEND_URL: string;

  constructor(
    @Inject(STRIPE) private stripe: Stripe,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.FRONTEND_URL = this.configService.get('FRONTEND_URL') || '';
  }

  async createCheckoutSession(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: createPaymentDto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email, // Required, Stripe needs email to send receipts
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;

      await this.prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            unit_amount: course.priceBaht * 100, // Stripe requires THB in satang
            product_data: {
              name: course.title,
              images: [course.imagePublicId],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        courseId: course.id,
      },
      success_url: `${this.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.FRONTEND_URL}/checkout/cancel`,
    });

    if (!session.url) {
      throw new InternalServerErrorException(
        'Stripe checkout URL not generated',
      );
    }

    return { url: session.url };
  }

  async getCheckoutSession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    });

    if (!session || session.payment_status !== 'paid') {
      throw new BadRequestException('Payment not confirmed');
    }

    const courseId = session.metadata?.courseId as string;
    const lineItem = session.line_items?.data[0];
    const price = lineItem?.price;
    const product = price?.product as Stripe.Product;

    return {
      sessionId,
      courseId,
      title: product.name,
      image: getCloudinaryUrl(FileType.IMAGE, product.images[0]),
      amountPaid: (session.amount_total ?? 0) / 100,
    };
  }
}
